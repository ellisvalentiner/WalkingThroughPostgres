$(function(){
	$("#typed").typed({
		strings: [
		  "SELECT city, temp_lo, temp_hi, prcp, date FROM weather;",
		  "INSERT INTO weather VALUES ('San Francisco', 46, 50, 0.25, '1994-11-27');",
		  "SELECT * FROM weather LEFT OUTER JOIN cities ON (weather.city = cities.name);",
		  "SELECT max(temp_lo) FROM weather;",
		  "DELETE FROM weather WHERE city = 'Hayward';",
		  "UPDATE accounts SET balance = balance - 100.00 WHERE name = 'Alice';"
	  ],
		typeSpeed: 80,
		backSpeed: 0,
		backDelay: 1000,
		shuffle: true,
		loop: true,
    callback: function(){
      shift();
    }
	});
});

function shift(){
    $(".head-wrap").addClass("shift-text");
    terminalHeight();
}

function terminalHeight(){
    var termHeight = $(".terminal-height");
    var value = termHeight.text();
    value = parseInt(value);
    setTimeout(function(){
        if (value > 10){
            value = value-1;
            this.txtValue = value.toString();
            termHeight.text(this.txtValue);
            self.terminalHeight();
        }
        else{
            clearTimeout();
        }
    }, 10);
}
