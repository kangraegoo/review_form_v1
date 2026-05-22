import bcrypt from 'bcryptjs'

const password = process.argv[2]
if (!password) {
  console.error('사용법: node scripts/gen-hash.mjs <비밀번호>')
  process.exit(1)
}

const hash = bcrypt.hashSync(password, 10)
console.log('\n비밀번호 해시:')
console.log(hash)
console.log('\n.env.local에 다음을 붙여넣으세요:')
console.log(`ADMIN_PASSWORD_HASH=${hash}`)
