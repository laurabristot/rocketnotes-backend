const { Router } = require('express')
const UsersControllers = require('../controllers/UsersControllers')
const UserAvatarController = require('../controllers/UserAvatarController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const multer = require('multer')
const uploadConfig = require('../configs/upload')

const userRoutes = Router()
const upload = multer(uploadConfig.MULTER)

const usersControllers = new UsersControllers()
const userAvatarController = new UserAvatarController()

userRoutes.post('/', usersControllers.create)
userRoutes.put('/', ensureAuthenticated, usersControllers.update)
userRoutes.patch(
  '/avatar',
  ensureAuthenticated,
  upload.single('avatar'),
  userAvatarController.update
)

module.exports = userRoutes
