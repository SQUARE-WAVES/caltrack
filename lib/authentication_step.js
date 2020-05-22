const cookie = require("cookie")

module.exports = async ( code = 'zzzxxxxqqqq420') => {
	//this kinda sucks, but hey
	return async (id,req,res) => {
		
		const cookie_text = req.headers["cookie"];
		const cook = cookie.parse(cookie_text);
		if(cook.inv_auth != code )
		{
			throw new Error("auth code invalid")
		}
	}
}