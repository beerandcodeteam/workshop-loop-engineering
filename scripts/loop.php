<?php

const MAX_TRIES = 3;

function claude(string $prompt, string $extra = '', bool $capture = false): string
{
    $cmd = 'claude -p '.escapeshellarg($prompt)
        .' --dangerously-skip-permissions --output-format text '
        .$extra.' < /dev/null';

    if (! $capture) {
        passthru($cmd);

        return '';
    }

    return (string) shell_exec($cmd.' 2>&1');
}

$file = file_get_contents('.spec/init/project-phases.md');
$phases = preg_match_all(
    '/^## Phase \d+:.*?(?=^## Phase \d+:|\z)/ms',
    $file,
    $matches
);

$phases = $matches[0];

foreach ($phases as $phase) {

    echo preg_split("/\n/", $phase)[0].PHP_EOL;

}

foreach ($phases as $phase) {
    $titulo = ltrim(preg_split("/\n/", $phase)[0], '# ');
    $causa = '';

    for ($attempt = 1; $attempt <= MAX_TRIES; $attempt++) {

        echo "Iniciando (tentativa $attempt/".MAX_TRIES."): $titulo".PHP_EOL;

        $prompt = <<<PROMPT
            Voce e um desenvolvedor senior. Implemente COMPLETAMENTE a fase abaixo.
            Sem TODOs, sem placeholders.
            $causa
            $phase
        PROMPT;

        claude($prompt);

        $saida = [];
        $code = 0;

        echo '<<<< INICIANDO TESTES >>>>>';

        exec('./vendor/bin/sail pest'.' < /dev/null 2>&1', $saida, $code);

        if ($code !== 0) {
            $causa = "A tentativa anterior falhou nos testes:\n"
                .implode("\n", array_slice($saida, -30));
            echo "    testes FALHARAM\n";

            continue;
        }

        echo '<<<< FIM TESTES >>>>>';

        $prompt = <<<PROMPT
            Voce e um verificador independente. NAO escreva nem edite nenhum arquivo.
            Leia o codigo real e responda EXATAMENTE UMA linha, sem mais nada:
                DONE
                FALTA — <o que ainda nao esta implementado>
                Na duvida, FALTA.
            $phase
        PROMPT;

        echo '<<<< INICIANDO VERIFICADOR >>>>>';

        $veridct = claude($prompt, '--allowedTools "Read,Glob,Grep"', true);

        if (preg_match('/^DONE/m', $veridct)) {
            echo "    avaliador OK\n";
            exec('git add -A && git commit -q -m '.escapeshellarg("feat: $titulo").' 2>&1');
            break;
        }

        $causa = "A tentativa anterior foi reprovada pelo avaliador: $veridct";
        echo "    avaliador REPROVOU: $veridct\n";

        if ($attempt === MAX_TRIES) {
            echo "    DESISTINDO de: $titulo\n";
        }

    }

}
