const { hash, compare } = require('bcryptjs')
const AppError = require('../utils/AppError')

const sqliteConnection = require('../database/sqlite')

class UsersControllers {
  async create(req, res) {
    const { name, email, password } = req.body

    const database = await sqliteConnection()
    const checkIfUserExists = await database.get(
      'SELECT * FROM USERS WHERE email = (?)',
      [email]
    )

    if (checkIfUserExists) {
      throw new AppError('Este email já está em uso.')
    }

    const hashedPassword = await hash(password, 8)

    await database.run(
      'INSERT INTO users (name, email, password) VALUES (?,?,?)',
      [name, email, hashedPassword]
    )

    return res.status(201).json()
  }

  async update(req, res) {
    const { name, email, password, old_password } = req.body
    const { id } = req.params

    const database = await sqliteConnection()

    const user = await database.get('SELECT * FROM users WHERE id = (?)', [id])

    if (!user) {
      throw new AppError('Usuário não encontrado')
    }

    const newEmail = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )

    if (newEmail && newEmail.id !== user.id) {
      throw new AppError('Email já está em uso')
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if (old_password && !old_password) {
      throw new AppError(
        'Você precisa informar a senha antiga para definir uma nova senha'
      )
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password)
      if (!checkOldPassword) {
        throw new AppError('A senha antiga não confere')
      }

      user.password = await hash(password, 8)
    }

    await database.run(
      `UPDATE users SET 
      name = ?, 
      email = ?, 
      password = ?,
      updated_at = DATETIME('now') 
      WHERE id = ?`,
      [user.name, user.email, user.password, id]
    )

    return res.status(200).json()
  }
}

module.exports = UsersControllers
