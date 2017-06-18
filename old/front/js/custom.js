
//Checkbox Limiting to 3
function checkboxLimit(j) {
	var total = 0;
		if(checks.efficient.checked){
			total += 1;
		}
		if(checks.helpful.checked){
			total +=1;
		}
		if(checks.knowledgeable.checked){
			total +=1;
		}
		if(checks.skilled.checked){
			total += 1;
		}
		if(checks.smart.checked){
			total += 1;
		}
		if(checks.teamPlayer.checked){
			total +=1;
		}
		if(checks.inefficient.checked){
			total +=1;
		}
		if(checks.unhelpful.checked){
			total +=1;
		}
		if(checks.ignorant.checked){
			total +=1;
		}
		if(checks.unskilled.checked){
			total +=1;
		}
		if(checks.dumb.checked){
			total +=1;
		}
		if(checks.selfish.checked){
			total +=1;
		}
		if(checks.cheater.checked){
			total +=1;
		}
		if(checks.scammer.checked){
			total +=1;
		}
		if(checks.troll.checked){
			total +=1;
		}
		if(total > 3){
			document.gamerReview.checks; return false;
		}
	}
//This has a bug. You can select 4 if you unselect 1 then reselect.
//Also if you set an alert to tell the user to only pick 3, it'll shoot the alert off 3 times.



//Character Counter
function countChars(textbox, counter, max) {
var count = max - document.getElementById(textbox).value.length;
     if (count < 0) { document.getElementById(counter).innerHTML = "<span style=\"color: red;\">" + count + "</span>"; }
     else { document.getElementById(counter).innerHTML = count + " characters remaining"; }
  }


















