import express from 'express';
import axios from 'axios';
import pool from '../configs/db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';


const router = express.Router();
dotenv.config();

router.post('/signup',async(req,res)=>{
    const {user_name, user_mail, password} = req.body;
    if(!password){
        return res.status(400).json({message: "Password is required"});
    }
    // unique mail response
    const existing_mail = await pool.query('SELECT * FROM users WHERE user_mail = $1', [user_mail]);
    if(existing_mail.rows.length>0){
        return res.status(400).json({message: "The account is already existing, try logging in"});
    }
    // unique name response
    const existing_name = await pool.query(
        'SELECT * FROM users WHERE user_name = $1', [user_name]);
    if(existing_name.rows.length>0){
        return res.status(400).json({message: "The user name is already existing , try something different"});
    }

    if(existing_name.rows.length<0 && existing_mail.rows.length<0){
        const hashPassword = await bcrypt.hash(password,10);
        const query = 'INSERT INTO users(user_name,user_mail,password_hash) VALUES($1,$2,$3) RETURNING *';
        try {
            const result = await pool.query(query,[user_name,user_mail,hashPassword]);
            const {password_hash,...user} = result.rows[0];
            res.status(201).json(user);
        }catch(err){
            res.status(500).send(err.message);
        }
    }
});

router.post('/login', async(req,res)=> {
    const{user_id,password} = req.body;
    const isEmail = user_id.includes('@');

    const query = isEmail
        ? 'SELECT * FROM users WHERE user_mail = $1'
        : 'SELECT * FROM users WHERE user_name = $1';

    if(!user_id || !password){
        return res.status(400).json({message: "User name or User email and Password required"});
    }
    
    const result = await pool.query(query,[user_id]);
    if(result.rows.length == 0){
        return res.status(404).json({message: "Account not Found"});
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password,user.password_hash);
    if(!match){
        return res.status(401).json({message: "Invalid Login Credentials"});
    }
    const token = jwt.sign({user_id:user.id},process.env.JWT_SECRET_KEY, {expiresIn:'24h'});
    res.status(200).json({message: "Login Successful",
        token,
        user: {
            user_name: user.user_name,
            user_mail: user.user_mail
        }
    });
});




export default router;
