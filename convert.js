import * as fs from 'fs';

const convertToJsx = (htmlFile, name) => {
    let content = fs.readFileSync(htmlFile, 'utf8');
    // extract body
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        content = bodyMatch[1];
    }
    
    // basic conversion
    content = content.replace(/class=/g, 'className=');
    content = content.replace(/for=/g, 'htmlFor=');
    content = content.replace(/<!--/g, '{/*').replace(/-->/g, '*/}');
    
    // close self-closing tags
    const scTags = ['img', 'input', 'br', 'hr', 'link', 'meta'];
    scTags.forEach(tag => {
        const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
        content = content.replace(regex, `<${tag}$1 />`);
    });
    
    // fix style properties if exists
    content = content.replace(/style="([^"]*)"/gi, (match, p1) => {
        const styleObj = p1.split(';').filter(Boolean).reduce((acc, current) => {
            let [key, ...valParts] = current.split(':');
            let val = valParts.join(':');
            if(key && val) {
                key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                acc[key] = val.trim();
            }
            return acc;
        }, {});
        if (Object.keys(styleObj).length === 0) return '';
        return `style={${JSON.stringify(styleObj)}}`;
    });

    // Handle react-router Link
    content = content.replace(/<a ([^>]*?)href="([^"]*)"([^>]*?)>/gi, `<Link $1to="$2"$3>`);
    content = content.replace(/<\/a>/gi, `</Link>`);

    const jsx = `import React from 'react';\nimport { Link } from 'react-router-dom';\n\nexport default function ${name}() {\n  return (\n    <div className="bg-surface text-on-surface antialiased">\n${content}\n    </div>\n  );\n}\n`;

    fs.writeFileSync(`C:/prime-research/src/pages/${name}.jsx`, jsx);
}

convertToJsx('C:/tmp_screens/home.html', 'Home');
convertToJsx('C:/tmp_screens/catalog.html', 'Catalog');
convertToJsx('C:/tmp_screens/detail.html', 'Detail');
