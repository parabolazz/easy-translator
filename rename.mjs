import fs from 'fs';
import path from 'path';

const searchTerms = [
    { from: /轻松翻译/g, to: '轻松翻译' },
    { from: /Easy Translator/g, to: 'Easy Translator' },
    { from: /easy-translator/g, to: 'easy-translator' },
    { from: /Easy Translator/g, to: 'Easy Translator' }
];

function walk(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        if (f.startsWith('.') || f === 'node_modules' || f === 'build') continue;
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p, callback);
        } else {
            callback(p);
        }
    }
}

walk(process.cwd(), (p) => {
    if (p.endsWith('.js') || p.endsWith('.json') || p.endsWith('.md') || p.endsWith('.html') || p.endsWith('.mjs')) {
        let text = fs.readFileSync(p, 'utf-8');
        let newText = text;
        for (const term of searchTerms) {
            newText = newText.replace(term.from, term.to);
        }
        if (text !== newText) {
            fs.writeFileSync(p, newText);
            console.log('Updated', path.relative(process.cwd(), p));
        }
    }
});
