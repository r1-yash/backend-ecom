import express from 'express';
import {registerController,loginController,testController} from '../controllers/authController.js';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';


//Create Router Obj
const router = express.Router();

//Routing

//REGISTER || POST (Register using POST method)
router.post('/register', registerController);

//LOGIN || POST (LogIn using POST method)
router.post('/login', loginController);

//Test || GET (Test Token base Secure Login)
router.get('/test', requireSignIn, isAdmin, testController);


export default router;