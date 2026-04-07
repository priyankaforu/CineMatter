import express from 'express';
import axios from 'axios';
import pool from '../configs/db.js';
import bcrypt from 'bcrypt';


const router = express.Router();

router.post('/',async(req,res)=>{
    const {user_name, user_mail, password} = req.body;
    if(!password){
        return res.status(400).json({message: "Password is required"});
    }
    const hashPassword = await bcrypt.hash(password,10);
    const query = 'INSERT INTO users(user_name,user_mail,password_hash) VALUES($1,$2,$3) RETURNING *';
    try {
        const result = await pool.query(query,[user_name,user_mail,hashPassword]);
        const {password_hash,...user} = result.rows[0];
        res.status(201).json(user);
    }catch(err){
        res.status(500).send(err.message);
    }
});

export default router;
