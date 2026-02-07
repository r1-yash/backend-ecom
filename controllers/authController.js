import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from 'jsonwebtoken';
import bcrypt from "bcrypt";
import { sendEmail } from "../helpers/emailService.js";
import { welcomeUserTemplate, adminNewUserTemplate } from "../helpers/emailTemplates.js";

//Create one call-back function for Registration for new user
export const registerController = async(req, res) => {

   try {

    const {name, email, password, phone, address} = req.body;

    // Data Validation
    if(!name){
        return res.status(400).send({
        success: false,
        message: "Name is required",
        });
        
    }
    if(!email){
        return res.status(400).send({
        success: false,
        message: "Email is required",
        });
        
    }
    if(!password){
        return res.status(400).send({
        success: false,
        message: "Password is required",
        });
        
    }
    if(!phone){
        return res.status(400).send({
        success: false,
        message: "Ph No is required",
        });
        
    }
    if(!address){
        return res.status(400).send({
        success: false,
        message: "Address is required",
        });
        
    }
    

    //Check the user is Already Exist or not
    const existingUser = await userModel.findOne({email});
    if(existingUser){
        return res.status(200).send({
            success: false,
            message: 'This Email is already Exist, please LogIn',
        })
    }

    //IF user is not Exist => Then Register the user

    //Encrypt the password by calling hashPassword() method from authHelper
    const hashedPassword = await hashPassword(password)

    //save the new user in database
    const newUser = await new userModel({name,email,phone,address,password:hashedPassword}).save()

    // ✅ Send welcome email (NON-BLOCKING)
    sendEmail({
        to: newUser.email,
        subject: "Welcome to E-Commerce App 🎉",
        html: welcomeUserTemplate(newUser),
    }).catch(console.error);

    // ✅ Notify admin (Optional)
    sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "New User Registration",
        html: adminNewUserTemplate(newUser),
    }).catch(console.error);

    //Send Response of Registration Successful of new user
    res.status(201).send({
        success: true,
        message: 'User is Registered successfully!',
        
    })
    
   } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message:'Error in Registration',
            error,
        })

   }
};


//Create one call-back function for LogIn for Existing user
export const loginController = async(req, res) =>{

    try {

        //DeStructure email & password from body
        const {email,password} = req.body;

        //Data-Validation
        if(!email || !password){
            return res.status(404).send({
                success:false,
                message:'Invalid email or password',

            })
        }


        //Check the user who want to LogIn is Exist or Not
        const user = await userModel.findOne({email})

        //send the response to the user if user is not registered in portal
        if(!user){
            return res.status(404).send({
                success:false,
                message:'Email is not Registered!'
            })
        }

        // ✅ FIX IS HERE
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send({
                success: false,
                message: "Invalid email or password",
            });
        }

        //Create Token
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {expiresIn: '7d'} )
        res.status(200).send({
            success:true,
            message:'Login successfully!',
            user:{
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address
            },
            token
        })

        
    } catch (error) {
        console.error("LOGIN ERROR 👉", error);
        res.status(500).send({
            success: false,
            message: "Error in LogIn!",
            error: error.message, // IMPORTANT
        });
    }
};

//Test (Create a Test-Controller for checking Token base login)
export const testController = (req,res) => {

   res.send('protected routes!');
};

