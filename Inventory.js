#pragma strict
var buttonSizeX:int = 50;
var buttonSizeY:int = 30;
var buttonClick:AudioClip;
private var audioPlayer:WorldAudioPlayer;

private var inventorySize:int = 25;
private var windowSize:int = 300;
private var windowPadding:int = 20;
private var inventorySlotSize:int = 50;
private var slotsPerRow:int = 5;

private var inventory:Item[] = new Item[inventorySize];
private var emptySlotTexture:Texture;
private var raycaster:Raycaster;
private var showInventory:boolean = false;
private var inventoryRect:Rect;
private var isMouseInInventory:boolean = false;
private var windowX:int;
private var windowY:int;
private var draggedItem:Item;
private var mousePosition:Vector2;
private var playerDresser:PlayerDresser;

function Start () {
/*	inventory[0] = new Item(0, "BoyShirt1", ItemSlot.BODY, "shirt1  description", ["BoyBody"], ["BoyBodyShirt01"], "characters/inventory/texture/sword1Icon", "characters/inventory/texture/sword1IconHover");
*/
}

function Update () {
	mousePosition = Input.mousePosition;
	mousePosition.y = Screen.height - Input.mousePosition.y;
	if(showInventory && inventoryRect.Contains(mousePosition)) {
		isMouseInInventory = true;
	} else {
		isMouseInInventory = false;
	}
	if(draggedItem != null){
		dragItem();
	}
}

function Awake () {
	raycaster = Camera.main.GetComponent(Raycaster);
	windowX = (Screen.width - windowSize)/2;
	windowY = (Screen.height - windowSize)/2;
	inventoryRect = new Rect(windowX, windowY, windowSize, windowSize);
	emptySlotTexture = Resources.Load("characters/inventory/texture/emptySlot");
	audioPlayer = Camera.main.GetComponent(WorldAudioPlayer);
	buttonClick = Resources.Load("sounds/Click1");
	playerDresser = gameObject.GetComponent(PlayerDresser);
}

function OnGUI() {
	if(showInventory) {
		GUI.BeginGroup(inventoryRect);
			GUI.Box (new Rect (0, 0, windowSize, windowSize), "Inventory");
			drawInvenotryGrid();
			if(GUI.Button(Rect(windowPadding, windowSize-buttonSizeY, buttonSizeX*2, buttonSizeY), "Sulge")){
				setShowOpenInventroyWindowToFalse();
				audioPlayer.Play(buttonClick, transform);
			}
		GUI.EndGroup ();
	}
	if(draggedItem != null){
		drawDraggedItem();
	}
}

function drawInvenotryGrid():void {
	var row:int;
	var column:int;
	var slotRect:Rect;
	for(var slot:int = 0; slot < inventorySize; slot++) {
		row = slot / slotsPerRow;
		column = slot - row*slotsPerRow;
		slotRect = new Rect(column*inventorySlotSize, row*inventorySlotSize, inventorySlotSize, inventorySlotSize);
		if(inventory[slot] == null) {
			GUI.DrawTexture(slotRect, emptySlotTexture);
		} else {
			drawSlotWithItem(slotRect, slot);
		}	
	}
}

function drawSlotWithItem(slotRect:Rect, slot:int) {
	if(isMouseInInventory && new Rect(slotRect.x + windowX, slotRect.y + windowY, inventorySlotSize, inventorySlotSize).Contains(mousePosition)) {
		GUI.DrawTexture(slotRect, emptySlotTexture);
		GUI.DrawTexture(slotRect, inventory[slot].getInventoryIcon());
		if(Input.GetMouseButtonDown(0)){
			grabFromSlot(slot);
		}
	} else {
		GUI.DrawTexture(slotRect, inventory[slot].getInventoryIcon());
	}
}

function setShowOpenInventroyWindowToTrue():void {
	raycaster.addOpenGuiWindow("inventory", inventoryRect);
	showInventory = true;
}

function setShowOpenInventroyWindowToFalse():void {
	raycaster.removeOpenGuiWindow("inventory");
	showInventory = false;
}

function openAndCloseInventoryWindow():void {
	if(!showInventory){
		setShowOpenInventroyWindowToTrue();
		audioPlayer.Play(buttonClick, transform);
	} else {
		setShowOpenInventroyWindowToFalse();
		audioPlayer.Play(buttonClick, transform);
	}
}

function dragItem():void {
	if(Input.GetMouseButtonUp(0)) {
		if(showInventory && isMouseInInventory){
			dropItemIntoSlot(getSlotHoverdByMouse(), draggedItem);
		} else {
			dropItem(draggedItem);
			draggedItem = null;
		}
	}
}

function drawDraggedItem():void {
	GUI.DrawTexture(new Rect(mousePosition.x - inventorySlotSize/2, mousePosition.y - inventorySlotSize/2, inventorySlotSize, inventorySlotSize), draggedItem.getInventoryIcon());
}

function grabFromSlot(slot:int):void {
	if(draggedItem != null) {
		dropItemIntoSlot(slot, draggedItem);
	} else {
		draggedItem = inventory[slot];
		playerDresser.equipItem(draggedItem);

		inventory[slot] = null;
	}
}

function dropItemIntoSlot(slot:int, item:Item):void {
	var temp:Item = inventory[slot];
	inventory[slot] = item;
	draggedItem = temp;
}

function dropItem(item:Item):void {
	Debug.Log("WARNING IS NOT IMPLEMENTED");
}

function getSlotHoverdByMouse():int {
	var positionInInventory:Vector2 = new Vector2(mousePosition.x - windowX, mousePosition.y - windowY);
	var column:int = positionInInventory.x / inventorySlotSize;
	var row:int = positionInInventory.y / inventorySlotSize;
	return row * slotsPerRow + column;
}

function slotItem(item:Item, slot:int):void {
	inventory[slot] = item;
}

function addNewItem(item:Item):void {
	for(var slot:int = 0; slot < inventorySize; slot++) {
		if(inventory[slot] == null) {
			slotItem(item, slot);
			return;
		}
	}
	Debug.Log("Could not add item, inventory full.");
}
