import fs from 'fs';
import path from 'path';

const htmlParts = [
    'src/parts/head.html',
    'src/parts/body1.html',
    'src/parts/body2.html',
    'src/parts/body3.html',
    'src/parts/modals.html'
];

const jsParts = [
    'src/parts/script1.js',
    'src/parts/script2.js',
    'src/parts/script3.js',
    'src/parts/script4.js',
    'src/parts/script5.js',
    'src/parts/script6.js',
    'src/parts/script7.js'
];

function build() {
    let indexHtml = '';
    for (const file of htmlParts) {
        indexHtml += fs.readFileSync(file, 'utf8') + '\n';
    }
    indexHtml += '<script src="/app.js"></script>\n</body>\n</html>\n';
    fs.writeFileSync('index.html', indexHtml, 'utf8');

    let appJs = '';
    for (const file of jsParts) {
        appJs += fs.readFileSync(file, 'utf8') + '\n';
    }
    fs.writeFileSync('public/app.js', appJs, 'utf8');
    console.log('Build complete: index.html and public/app.js generated successfully.');
}

build();
