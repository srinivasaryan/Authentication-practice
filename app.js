const express=require("express")
const app=express()
const path=require("path");
const {open}=require("sqlite")
const sqlite3=require("sqlite3");
const bcrypt=require("bcrypt");

app.use(express.json())
const dpPath=path.join(__dirname,"userData.db");
let db=null;
const initialDbServer=async()=>
{
    try {
       db=await open(
           {
               filename:dpPath
               driver:sqlite3.Database
           }
       ) 
       app.listen(3000,()=>
       {
           console.log("Server is Running Successfully")
       })
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}
initialDbServer();
const validatePassword=(password)=>
{
    return password.length>4;
}
app.post('/register/',async(request,response)=>
{
    const {username,name,password,gender,location}=request.body;
    const hashedPassword=await bcrypt(password,10);
    const SelectUserQuery=`SELECT * FROM user WHERE username=${username}`
    const dbUser=await db.get(SelectUserQuery);
    if(dbUser===undefined)
    {
       const CreateUserName=`INSERT INTO user(username,name,password,gender,location)
       VALUES(
            ${username},${name},${hashedPassword},${gender},${location}
       )`
    if(validatePassword(password))
    {
        await db.run(CreateUserName);
        response.send("User created successfully");
    }
    else
    {
        response.status(400)
        response.send("Password is too Short");
    }
}else
{
    response.status(400);
    response.send("User already exists");
}

})
app.post("/login",async(response,request)=>
{
    const {username,password}=request.body;
    const selectUserQuery=`SELECT * FROM user WHERE username=${username}`;
    const databaseUser=await db.get(selectUserQuery);
    if(databaseUser===undefined)
    {
        response.status(400)
        response.send("Invalid User");
    }else{
        const isPasswordMatched=await bcrypt.compare(password,databaseUser.password)

    }
    if(isPasswordMatched===true)
    {
        response.send("Login Success");
    }
    else
    {
        response.status(400)
        response.send("Invalid Password");
    }
})
app.put("/change-password",async(request,response)=>
{
    const {username,oldPassword,newPassword}=request.body;
    const selectUserQuery=`SELECT * FROM user WHERE username=${username}`
    const databaseUser=await db.get(selectUserQuery);
    if(databaseUser===undefined)
    {
        response.status(400);
        response.send("Invalid User");
    }
    else 
    {
        const isPasswordMatched=await bcrypt.compare(oldPassword,newPassword);
    }
    if(isPasswordMatched===true)
    {
        if(validatePassword(newPassword))
        {
            const hashedPassword=await bcrypt.hash(newPassword,10);
            const updatePasswordQuery=`UPDATE user SET password=${hashedPassword} where username=${username}`
            const user=await db.run(updatePasswordQuery);
            response.send("Password Updated")

        }
        else{
            response.status(400)
            response.send("Password is too short")
        }

    }
    else{
        response.send(400);
        response.send("Invalid Current Password")
    }
})