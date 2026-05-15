import * as esbuild from 'esbuild'
import { mkdirSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function build() {
  const outdir = join(__dirname, 'dist')
  if (!existsSync(outdir)) {
    mkdirSync(outdir, { recursive: true })
  }
  const manifestPath = join(__dirname, '../frontend/dist/client/.vite/manifest.json')
  let cssFile = 'main.css'
  let jsFile = 'main.js'
  let vendorFile = 'vendor.js'
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    const mainEntry = manifest['index.html']
    if (mainEntry) {
      jsFile = mainEntry.file?.split('/').pop() || jsFile
      if (mainEntry.css && mainEntry.css[0]) {
        cssFile = mainEntry.css[0].split('/').pop() || cssFile
      }
    }
    const vendorKey = Object.keys(manifest).find(key => manifest[key].name === 'vendor')
    if (vendorKey && manifest[vendorKey].file) {
      vendorFile = manifest[vendorKey].file.split('/').pop() || vendorFile
    }
  }
  console.log(`Asset files: JS=${jsFile}, CSS=${cssFile}, Vendor=${vendorFile}`)
  await esbuild.build({
    entryPoints: [join(__dirname, 'src/handler.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: join(outdir, 'handler.js'),
    minify: true,
    sourcemap: false,
    external: [],
    define: {
      'process.env.NODE_ENV': '"production"',
      '__CSS_FILE__': JSON.stringify(cssFile),
      '__JS_FILE__': JSON.stringify(jsFile),
      '__VENDOR_FILE__': JSON.stringify(vendorFile),
    },
    jsx: 'automatic',
    tsconfig: join(__dirname, 'tsconfig.json'),
  })
  console.log('Lambda@Edge build complete!')
  console.log('Creating zip...')
  execSync('zip -j lambda.zip handler.js', { cwd: outdir, stdio: 'inherit' })
  console.log('Zip created!')
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
