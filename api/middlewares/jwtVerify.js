import jwt from 'jsonwebtoken'
export const verifyToken = (req,res,next)=>{

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("You are not authenticated!");

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).send("You are not authenticated!");

    jwt.verify(token,process.env.SECRET_KEY,async(err,payload)=>{
        console.log(payload,'payload');
       
        if(err) return res.status(403).send("Token is not valid");
        req.userId = payload.userId;
        req.isTeacher = payload.isTeacher;
        req.isAdmin = payload.isAdmin;
        req.middlewareRole = payload.role;
        req.email = payload.email;
        req.name = payload.name;
        console.log(req.userId,req.isTeacher,req.isAdmin,req.email,req.name,'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
        next()
    });
}