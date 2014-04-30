#pragma strict
var answer:int;
var columns = new Array();
var operators = new Array();
var selectedColumn:Transform;
var columnPrefab:Transform;
var operatorPrefab:Transform;
var answerPrefab:Transform;
var answerObject:Transform;

private var nextColumnIndex:int = 0;
private var selectedColumnIndex:int = 0;
private var server:ServerConnection;

enum Direction { LEFT, RIGHT };

private var currentXLocation:int = -8;

function Start () {
	(columns[selectedColumnIndex] as Transform).GetComponent(ColumnScript).select();
	selectedColumn = (columns[selectedColumnIndex] as Transform);
}

function Update () {
}

function Awake() {
		
	gameObject.AddComponent(EquationResults);
	server = Camera.main.transform.GetComponent(ServerConnection);

}

function generateAnswer():void {
	answer = getRandomValue();
	var times:int = 0;
	while(answer > GameObject.Find("gameCode").GetComponent(EquationManager).getMarginalRate()){
		answer = getRandomValue();
		times++;
		Debug.Log("Generated Answer " + times);
		if(times > 10){
			//GameObject.Find("gameCode").GetComponent(EquationManager).createEquation();
			break;
		}
	}
	addAnswer(answer);
}

function setEquationStartPosition(xLocation:Number):void {
	var setTo:Number;
	switch(xLocation){
		case 2:
			setTo = -5.5;
			break;
		case 3:
			setTo = -6;
			break;
		case 4:
			setTo = -8;
			break;
	}
	this.currentXLocation = setTo;
}

function addAnswer(answerValue:int):void {
	answer = answerValue;
	answerObject = Instantiate(answerPrefab, Vector3(currentXLocation,0,0), transform.rotation);
	answerObject.GetComponent(AnswerScript).setValue(answerValue);
	answerObject.transform.parent = transform;
}

function addColumn(numbers:Array):void {
	Debug.Log("teeb columni");
	var newColumn:Transform = Instantiate(columnPrefab, Vector3(currentXLocation,0,0), transform.rotation);
	currentXLocation += 2;
	newColumn.GetComponent(ColumnScript).generateColumn(numbers, transform, nextColumnIndex);
	columns.Push(newColumn);
	selectedColumn = newColumn;
	nextColumnIndex++;
}

function addOperator(OperatorSign:String):void {
	var operator:Transform = Instantiate(operatorPrefab, Vector3(currentXLocation,0,0), transform.rotation);
	operator.GetComponent(OperatorScript).setOperatorType(OperatorSign, transform);
	operators.Push(operator);
	currentXLocation += 2;
}

function moveUp():void {
	selectedColumn.GetComponent(ColumnScript).moveUp();
}

function moveDown():void {
	selectedColumn.GetComponent(ColumnScript).moveDown();
}

function select(direction:Direction):void {
	switch(direction){
		case Direction.LEFT:
			if(selectedColumnIndex > 0){
				(columns[selectedColumnIndex] as Transform).GetComponent(ColumnScript).deSelect();
				selectedColumn.GetComponent(ColumnScript).deSelect();
				selectedColumnIndex--;
				selectedColumn = (columns[selectedColumnIndex] as Transform);
				selectedColumn.GetComponent(ColumnScript).select();
			}
			break;
		case Direction.RIGHT:
			if(columns.length > selectedColumnIndex+1){
				(columns[selectedColumnIndex] as Transform).GetComponent(ColumnScript).deSelect();
				selectedColumn.GetComponent(ColumnScript).deSelect();
				selectedColumnIndex++;
				selectedColumn = (columns[selectedColumnIndex] as Transform);
				selectedColumn.GetComponent(ColumnScript).select();
			}
			break;
	}
}

function selectColumn(input:int):void {
	(columns[selectedColumnIndex] as Transform).GetComponent(ColumnScript).deSelect();
	selectedColumnIndex = input;
	(columns[selectedColumnIndex] as Transform).GetComponent(ColumnScript).select();
	selectedColumn = (columns[selectedColumnIndex] as Transform);
}

function getCurrentValue():int {
	var result:int=0;
	var operatorCounter:int = -1;
	for (var column:Transform in columns){
		if(operatorCounter == -1){
			result += column.GetComponent(ColumnScript).getValue();
		}else{
			if((operators[operatorCounter] as Transform).FindChild("ValueText").GetComponent(TextMesh).text == "+"){
				result += column.GetComponent(ColumnScript).getValue();
			}else{
				result -= column.GetComponent(ColumnScript).getValue();
			}
		}
		operatorCounter++;
	}
	return result;
}

function getColumnCount():int {
	return columns.length;
}

function getRandomValue():int {
	var result:int=0;
	var operatorCounter:int = -1;
	for (var column:Transform in columns){
		if(operatorCounter == -1){
			result += column.GetComponent(ColumnScript).getRandomValue();
		}else{
			if((operators[operatorCounter] as Transform).FindChild("ValueText").GetComponent(TextMesh).text == "+"){
				result += column.GetComponent(ColumnScript).getRandomValue();
			}else{
				result -= column.GetComponent(ColumnScript).getRandomValue();
			}
		}
		operatorCounter++;
	}
	return result;
}

function showEquation():void {
	for(var column:Transform in columns) {
		column.GetComponent(ColumnScript).showColumn();
	}
	for(var operator:Transform in operators) {
		operator.GetComponent(OperatorScript).show();
	}
	answerObject.GetComponent(AnswerScript).show();
	randomize();
}

function hideEquation():void {
	for(var column:Transform in columns) {
		column.GetComponent(ColumnScript).hideColumn();
	}
	for(var operator:Transform in operators) {
		operator.GetComponent(OperatorScript).hide();
	}
	answerObject.GetComponent(AnswerScript).hide();
}

function randomize():void {
	for(var column:Transform in columns) {
		column.GetComponent(ColumnScript).moveRandom();
	}
}

function checkAnswer():void {
	if(isCorrect()){
		transform.GetComponent(EquationResults).addResult(true);
		Camera.main.GetComponent(ObjectAudioPlayer).play(SoundType.correctAnswer);
		GameObject.Find("gameCode").transform.GetComponent(EquationManager).nextEquation();
		server.sendCommand(new Command(Type.EQUATIONANSWER));
	} else {
		transform.GetComponent(EquationResults).addResult(false);
		Camera.main.GetComponent(ObjectAudioPlayer).play(SoundType.wrongAnswer);
	}
}

function isCorrect():boolean {
	Debug.Log(getCurrentValue() + " = " + answer);
	if(getCurrentValue() == answer){
		return true;
	} else {
		return false;
	}
}

function getCurrentEquationState():String {
	var result:String = "";
	for(var i:int = 0; i < columns.length; i++){
		var column = columns[i] as Transform;
		result += column.GetComponent(ColumnScript).getValue();
		if(i == columns.length-1){
			result += " = ";
		}else{
			result += (operators[i] as Transform).FindChild("ValueText").GetComponent(TextMesh).text;
		}
	}
	result += answer;
	return result;
}