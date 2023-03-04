
const express = require('express');

const router =  express.Router();
const bankAccount = require('../models/bank_account.model')


router.get('/', async (req, res, next)=>{
    // next(new Error('Can not get the list of bankaccount'))
    try{
        const result = await bankAccount.find({}, {
            __v: 0,
            phone_number: 0,
            _id: 0
        });
        return res.json({
            status: 'success',
            data: result
        });
    }catch(error){
        res.sendStatus(401).json({
            error:{
                code: 1,
                msg: error.message
            }
        })
    }

})

router.post('/', async (req, res)=>{
    const name = removeAccents(req.body.name) 

    try{
        const newBankAccount = new bankAccount({
            name: name,
            bank_account_number: req.body.bank_account_number,
            date: req.body.date,
            balance: req.body.balance,
            type: req.body.type,
            phone_number: req.body.phone_number
        });
        const result = await newBankAccount.save();
        return res.json({
            status: 'success',
            data: result
        });
    }catch(error){
        res.sendStatus(401).json({
            error:{
                code: 1,
                msg: error.message
            }
        })
    }

})

router.get("/:type-:bank_account_number", async (req, res) => {
    const bankAccountNumber = req.params.bank_account_number
    try{
        const bankAccountInfo = await bankAccount.find({
            bank_account_number: bankAccountNumber,
            type: req.params.type
        },{
            __v: 0,
            phone_number: 0,
            type:0,
            _id: 0
        })
        if(bankAccountInfo.length > 0){
            return res.json({
                status: "success",
                data: bankAccountInfo[0]
            })
        }
        else{
            return res.json({
                status: "success",
                msg: "Số tài khoản ngân hàng không tồn tại!"
            });
        }
        
    }catch(error){
        res.sendStatus(401).json({
            error:{
                code: 1,
                msg: error.message
            }
        })
    }
})

router.put('/:type-:bank_account_number', async (req, res)=>{
    if(req.body.balance < 0){
        return res.json([{
            status: 'fail',
            msg: 'Số dư phải lớn hơn bằng 0'
        }])
    }
    try{
        const name = removeAccents(req.body.name)

        const bankAccountNumber = req.params.bank_account_number;

        const result = await bankAccount.findOneAndUpdate({
            bank_account_number: bankAccountNumber,
            type: req.body.type
        }, {
            name: name,
            bank_account_number: req.body.bank_account_number,
            date: req.body.date,
            balance: req.body.balance,
            type: req.body.type,
            phone_number: req.body.phone_number
        })
    
        return res.json({
            status: 'success',
            msg: "Sửa thông tin tài khoản ngân hàng thành công."
        });
    }
    catch(error){
        res.sendStatus(401).json({
            error:{
                code: 1,
                msg: error.message
            }
        })
    }
})

router.delete('/:type-:bank_account_number',async (req, res)=>{
    const bankAccountNumber = req.params.bank_account_number
    try{
        const accountInfo = await bankAccount.findOneAndDelete({
            bank_account_number: bankAccountNumber,
            type: req.params.type
        },{})    
        
        if(accountInfo){
            return res.json({
                status: 'success',
                data: accountInfo,
                msg: "Xóa thông tin tài khoản ngân hàng thành công!",
            })
        }
        else{
            return res.json({
                status: 'fail',
                msg: "Tài khoản ngân hàng không tồn tại",
            })
        }
    }catch(error){
        res.sendStatus(401).json({
            error:{
                code: 1,
                msg: error.message
            }
        })
    }
})

router.post('/check-transfer-money', async (req, res) => {
    const sendBankAccount = req.body.send_bank_account
    const money =  req.body.money
    if(money < 0 || isNaN(money)){
        return res.json({
            status: "fail",
            msg: "Số tiền không hợp lệ"
        })
    }
    try{
        const bankAccountInfo = await bankAccount.findOne({bank_account_number: sendBankAccount},{})
        if(bankAccountInfo){
            if(bankAccountInfo.balance > money){
                return res.json({
                    status: 'success',
                    msg: "Tài khoản ngân hàng đủ điều kiện thực hiện giao dịch!"
                })
            }
            else{
                return res.json({
                    status: 'fail',
                    msg: "Tài khoản ngân hàng không đủ điều kiện thực hiện giao dịch!"
                })
            }
        }
        else{
            return res.json({
                status: 'fail',
                msg: "Tài khoản ngân hàng không tồn tại."
            })
        }
    }catch(err){
        res.sendStatus(401).json({
            error:{
                code: 1,
                msg: error.message
            }
        })
    }
})

router.post('/receive', async(req,res, next) => {
    const bankAccountNumber = req.body.bank_account_number
    const money = req.body.money
    if(money<0 || isNaN(money)){
        return res.json({
            status: "fail",
            msg: "Số tiền không hợp lệ"
        })
    }
    try{
        const bankAccountInfo =  await bankAccount.findOne({bank_account_number: bankAccountNumber})
        if(!bankAccountInfo){
            return res.json({
                status: 'fail',
                msg: "Tài khoản ngân hàng không tồn tại."
            })
        }
        bankAccountInfo.balance += money;
        const result = await bankAccount.findOneAndUpdate({bank_account_number: bankAccountNumber},bankAccountInfo)
        if(result){
            return res.json({
                status: 'success',
                msg: "Nhận tiền thành công"
            })
        }
        else{
            return res.json({
                status: 'fail',
                msg: "Nhận tiền thất bại"
            })
        }
    }
    catch(err){
        res.sendStatus(401).json({
            error:{
                code: 1,
                msg: error.message
            }
        })
    }
})

router.post("/transfer-money", async(req, res, next) => {

    const bankAccountNumber = req.body.bank_account_number
    const money = req.body.money
    if(money<=0 || isNaN(money)){
        return res.json({
            status: "fail",
            msg: "Số tiền không hợp lệ",
            sotien: money
        })
    }

    try{
        const bankAccountInfo =  await bankAccount.findOne({bank_account_number: bankAccountNumber})
        if(!bankAccountInfo){
            return res.json({
                status: 'fail',
                msg: "Tài khoản ngân hàng không tồn tại."
            })
        }
        bankAccountInfo.balance -= money;
        const result = await bankAccount.findOneAndUpdate({bank_account_number: bankAccountNumber},bankAccountInfo)
        if(result){
            return res.json({
                status: 'success',
                msg: "Chuyển tiền thành công"
            })
        }
        else{
            return res.json({
                status: 'fail',
                msg: "Chuyển tiền thất bại"
            })
        }
    }
    catch(err){
        res.status(400).json({
            error:{
                code: 1,
                msg: err.message
            }
        })
    }
})

router.post('/link-bank-account', async (req, res) => {
    const nameBankAccount = removeAccents(req.body.name)
    const bankAccountNumber = req.body.bank_account_number
    const date = req.body.date

    try{
        const bankAccountInfo = await bankAccount.findOne({bank_account_number: bankAccountNumber})
        if(bankAccountInfo){
            // console.log(name)
            if(nameBankAccount.toUpperCase  == bankAccountInfo.name.toUpperCase){
                return res.json({
                    status: 'success',
                    data: {
                        code: Math.floor(Math.random()*899999 + 100000) 
                    }
                    
                })
            }
        }
        return res.json([{
            status: 'fail',
            msg: 'Thông tin không tồn tại!'
        }])
    }
    catch(error){
        res.sendStatus(401).json({
            error:{
                code: 1,
                msg: error.message
            }
        })
    }
})

router.get('/test', (req, res) => {
    return res.json({
        status: 'success',
        data: 
            'hello mọi người'
        
    })
})

function removeAccents(str) {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }



module.exports = router