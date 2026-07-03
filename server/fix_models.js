const fs = require('fs');
const path = require('path');
const dir = 'd:/Messbee2/messbee/server/models';

fs.readdirSync(dir).forEach(file => {
    if (!file.endsWith('.js')) return;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;
    if (content.includes('import mongoose from \\'mongoose\\';')) {
        content = content.replace('import mongoose from \\'mongoose\\';', 'const mongoose = require(\\'mongoose\\');');
        modified = true;
    }
    if (content.includes('import mongoose from "mongoose";')) {
        content = content.replace('import mongoose from "mongoose";', 'const mongoose = require(\\'mongoose\\');');
        modified = true;
    }
    
    // Replace "export default ModelName;"
    const exportRegex = /export\s+default\s+([A-Za-z0-9_]+);?/g;
    if (exportRegex.test(content)) {
        content = content.replace(exportRegex, 'module.exports = ;');
        modified = true;
    }
    
    // Replace "export default mongoose.model"
    const exportModelRegex = /export\s+default\s+mongoose\.model/g;
    if (exportModelRegex.test(content)) {
        content = content.replace(exportModelRegex, 'module.exports = mongoose.model');
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed ' + file);
    }
});
