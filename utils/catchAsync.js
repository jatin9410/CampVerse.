module.exports= (func)=>{             //this function accepts a function and then in return it executes a function and if there is an error then it will be caught in catch and will be sent to the next error handler
  return (req, res, next)=>{
    func(req, res, next).catch(next);
  }
}

//
