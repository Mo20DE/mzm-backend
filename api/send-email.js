module.exports = async (event) => {
    console.log("Function triggered!"); 

    return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: "Function reached!" })
    };
};