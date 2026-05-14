const fs = require('fs');

function prefixTailwindClasses(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Encuentra todos los atributos className
    content = content.replace(/className=(?:\"([^\"]+)\"|\{`([^`]+)`\})/g, (match, p1, p2) => {
        const classesStr = p1 || p2;
        if (!classesStr) return match;

        // Separa las clases, procesa cada una
        const words = classesStr.split(/\s+/);
        const prefixedWords = words.map(w => {
            if (!w) return w;
            
            // Ignorar variables interpoladas o clases condicionales simples por ahora
            if (w.includes('${')) return w;
            
            // Ya tiene el prefijo
            if (w.startsWith('tw-') || w.includes(':tw-')) return w;
            
            // Manejar modificadores como hover:, group-hover:, focus:, md:
            if (w.includes(':')) {
                const parts = w.split(':');
                const baseClass = parts.pop(); // La clase base es el último elemento
                if (baseClass && !baseClass.startsWith('tw-')) {
                    parts.push('tw-' + baseClass);
                    return parts.join(':');
                }
                return w;
            }
            
            // Excepciones conocidas que no llevan prefijo tw-
            if (w === 'group' || w === 'absolute' || w === 'relative' || w === 'flex' && match.includes('tw-')) {
                // Si la clase ya fue procesada parcialmente y tiene sentido, ignoramos
            }
            
            // Prefix estándar
            return 'tw-' + w;
        });

        const newClasses = prefixedWords.join(' ');
        
        if (p1) return `className="${newClasses}"`;
        if (p2) return `className={\`${newClasses}\`}`;
    });

    // Correcciones manuales para errores dobles
    content = content.replace(/tw-tw-/g, 'tw-');

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
}

prefixTailwindClasses('c:/PROYECTO/FoodStocker/Frontend/src/Reportes/PerdidasCrud.jsx');
prefixTailwindClasses('c:/PROYECTO/FoodStocker/Frontend/src/Reportes/PerdidasForm.jsx');
