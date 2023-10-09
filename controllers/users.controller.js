const {tb_product} = require("../models")
const {tb_users,tb_price} = require("../models")

// bcrypt
const bcrypt = require('bcrypt')

// JWT
const {createTokens} = require("../middleware/jwt")


const getUsersHome = async (req,res)=>{
    try {
        // const data = req.cookies["access-token"]
        const dataNavbar = req.user
        if (dataNavbar) {
            res.render("user-home",{dataNavbar})
        }else{
            const dataNavbar = null
            res.render("user-home",{dataNavbar})
        }
    } catch (error) {
        res.status(400).json({
            message : "ERROR",
            errMessage : error.message
        })
    }
}
const getUsersProduct = async (req,res)=>{
    try {
            const data = await tb_product.findAll({
                include:[{
                    model : tb_price
                }]
            })
            const dataNavbar = req.user
            res.render("user-product",{data,dataNavbar})
    } catch (error) {
        res.status(400).json({
            message : "ERROR",
            errMessage : error
        })
    }
}

const registration = async (req,res)=>{
    const {name,email,password} = req.body
    try {
        const registered = await tb_users.findOne({
            where:{email}
        })
        if (registered) {
            res.status(401).json({
                message : "Email sudah terdaftar",
                statusCode : 401,
            })
        }else{
            await tb_users.create({
                name,email,password,role:"customer"
            })
            res.json({
                message:"SUCCESS",
                statusCode:200
            })
        }
    } catch (error) {
        res.json({
            message:"ERROR",
            messageError: error.message,
            statusCode:400,
        })
    }
}

const loginPage = async(req,res)=>{
    res.render("user-login")
}

const login = async(req,res)=>{
    const {email,password} = req.body
    try {
        const user = await tb_users.findOne({
            where:{email}
        })
        if(!user){
            res.status(400).json({
                message :"email belum didaftarkan",
                statusCode : 401
            })
        }
        else if(password!=user.password){
            res.status(400).json({
                message : "password salah",
                statusCode : 402
            })
        }else{
            const accessToken = createTokens(user)
            res.cookie("access-token", accessToken,{
                maxAge : 3600000*240
            })
            res.status(200).json({
                message : "anda berhasil login",
                statusCode : 200,
                role:user.role
            })
        }
    } catch (error) {
        res.status(404).json({
            message : "ERROR",
            errMessage : error.message
        })
    }
}

const logout = (req,res)=>{
    try {
        res.clearCookie("access-token")
        res.json({
            message : "SUCCESS"
        })
    } catch (error) {
        res.json({
            message : "ERROR",
            errMessage : error.message
        })
    }
}

module.exports = {
    getUsersHome,
    getUsersProduct,
    registration,
    loginPage,
    login,
    logout
}