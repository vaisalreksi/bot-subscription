import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const distDir = join(rootDir, 'dist');

// Copy directory recursively
const copyDir = (src, dest) => {
    mkdirSync(dest, { recursive: true });
    const entries = readdirSync(src);

    for (const entry of entries) {
        const srcPath = join(src, entry);
        const destPath = join(dest, entry);
        const stat = statSync(srcPath);

        if (stat.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            copyFileSync(srcPath, destPath);
            console.log(`📄 Copied: ${entry}`);
        }
    }
};

const build = () => {
    console.log('🔨 Building for production...\n');

    // Clean dist folder
    if (existsSync(distDir)) {
        rmSync(distDir, { recursive: true });
        console.log('🧹 Cleaned dist folder');
    }

    // Create dist folder
    mkdirSync(distDir, { recursive: true });

    // Copy src folder
    console.log('\n📦 Copying source files...');
    copyDir(join(rootDir, 'src'), join(distDir, 'src'));

    // Copy package.json
    copyFileSync(join(rootDir, 'package.json'), join(distDir, 'package.json'));
    console.log('📄 Copied: package.json');

    // Copy package-lock.json if exists
    const lockFile = join(rootDir, 'package-lock.json');
    if (existsSync(lockFile)) {
        copyFileSync(lockFile, join(distDir, 'package-lock.json'));
        console.log('📄 Copied: package-lock.json');
    }

    console.log('\n✅ Build completed!');
    console.log(`📁 Output: ${distDir}`);
    console.log('\n📝 To run in production:');
    console.log('   1. cd dist');
    console.log('   2. npm install --production');
    console.log('   3. Create .env file with TOKEN and CLIENT_ID');
    console.log('   4. npm start');
};

build();
