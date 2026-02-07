import bcrypt from 'bcrypt';

//create function for hashing  normal password & Export it
export const hashPassword = async(password) => {
    if (!password) throw new Error("Password is required");
    try {

        const saltRound = 10;
        const hasedPassword = await bcrypt.hash(password, saltRound);
        return hasedPassword;
        
    } catch (error) {
        console.log(error);
        throw new Error("Password hashing failed");
    }
};

//Create function for checking normal-password & hased-password is same or not & Export it
export const comparePassword = async(password, hasedPassword) => {
    
    if (!password || !hashedPassword){
        throw new Error("Password and hash are required");
    }
    
  return await bcrypt.compare(password, hashedPassword);
};
