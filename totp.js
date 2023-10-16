(function()
{
    "use strict";
    /*global document, sjcl*/

    function HOTP(K, C)
    {
        var key = sjcl.codec.base32.toBits(K);
        console.log("key"+key)
        // Count is 64 bits long.  Note that JavaScript bitwise operations make
        // the MSB effectively 0 in this case.
        var count = [((C & 0xffffffff00000000) >> 32), C & 0xffffffff];
        console.log("count"+count);
        var otplength = 6;

        var hmacsha1 = new sjcl.misc.hmac(key, sjcl.hash.sha1);
        console.log("hmac"+hmacsha1)
        var code = hmacsha1.encrypt(count);

        var offset = sjcl.bitArray.extract(code, 152, 8) & 0x0f;
        var startBits = offset * 8;
        var endBits = startBits + 4 * 8;
        var slice = sjcl.bitArray.bitSlice(code, startBits, endBits);
        var dbc1 = slice[0];
        var dbc2 = dbc1 & 0x7fffffff;
        var otp = dbc2 % Math.pow(10, otplength);
        var result = otp.toString();
        console.log("result"+result)
        while (result.length < otplength)
        {
            result = '0' + result;
        }
        return result;
    }

    //
    // UI Functions
    //

    function GenerateHOTP()
    {
       var secret = document.getElementById('secret').value;
       var counterEl = document.getElementById('hotpcounter');
       var counter = parseInt(counterEl.value, 10);
       var otp = HOTP(secret, counter);
       var passwordEl = document.getElementById('hotpresult');
       while (passwordEl.hasChildNodes())
       {
           passwordEl.removeChild(passwordEl.firstChild);
       }
       passwordEl.textContent = "HOTP: " + otp;
       counterEl.value = counter + 1;
    }

    function GenerateTOTP()
    {
       var secret = document.getElementById('secret').value;
       var ctime = Math.floor(Date.now() / 60000); // 每分钟一个计数
       var counterEl = document.getElementById('totpcounter');
       counterEl.value = ctime;
       var otp = HOTP(secret, ctime);
       console.log("otp is"+otp)
       var passwordEl = document.getElementById('totpresult');
       while (passwordEl.hasChildNodes())
       {
           passwordEl.removeChild(passwordEl.firstChild);
       }
       passwordEl.textContent = "TOTP: " + otp;
    }

    function ConfigureHandlers()
    {
        var el = document.getElementById('generateotp');
        el.addEventListener('click', GenerateHOTP, false);
        setInterval(GenerateTOTP, 1000);

        GenerateHOTP();
        GenerateTOTP();
    }

    document.addEventListener('DOMContentLoaded', ConfigureHandlers, false);
}
)();