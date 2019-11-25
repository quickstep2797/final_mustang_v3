// Array variables 
var URLArray = [];
var NameArray = []; 
var preferredName = [];
var EmailArray = [];
var CityArray = [];
var StateArray = [];
var ZipArray = [];

var contacts = [];
var contactContainer = document.getElementById("con");
var currentContactIndex = 0;

function initApplication() {
    document.getElementById("nameID").value = "";   
    document.getElementById("emailID").value = "";   
    document.getElementById("cityID").value = "";   
    document.getElementById("stateID").value = "";
    document.getElementById("zipID").value = "";  
}

function setStatus(status) {
    document.getElementById("statusID").innerHTML = status;    
}

function importContacts() {
    console.log("importContacts()");
    loadIndexAndContacts();
}

function saveContactsToServer() {
    console.log("saveContactsToServer()");
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log('Response: ' + this.responseText);
            setStatus(this.responseText)
        }
    };
    xmlhttp.open("POST", "save-contacts.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("contacts=" + JSON.stringify(contacts));   
}

function loadContactsFromServer() { //loading the contacts function
    console.log("loadContactsFromServer()");
    contacts.length = 0;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {

        if (this.readyState == 4 && this.status == 200) {
            contacts = JSON.parse(this.responseText);
            setStatus("Loaded contacts (" + contacts.length + ")");
            currentContactIndex = 0;
            viewCurrentContact()
        }
    };
    xmlhttp.open("GET", "load-contacts.php", true);
    xmlhttp.send();   
}
function previous() {

	// if contact is greater than zero then subtract from index
    if (currentContactIndex > 0) {
		currentContactIndex--;
		
	// if index is equal to zero, then the previous button will be disabled	
	if(currentContactIndex == 0){
		document.getElementById("pre").disabled = true;		
	}

	// if the index is greater than the length - 1, the next button will be disabled. 
	if(currentContactIndex != (contacts.length - 1)){
		document.getElementById("next").disabled = false;
		}
		
		update(); 
    }
    currentContact = contacts[currentContactIndex];
    viewCurrentContact();
}

function next() {
    if (currentContactIndex < (contacts.length-1)) {
        currentContactIndex++;
		
		//The if statements below disable the buttons when the currentContactIndex = the highest value.
		if(currentContactIndex != 0) {
			document.getElementById("pre").disabled = false;
		}
		if(currentContactIndex == (contacts.length - 1)) {
			document.getElementById("next").disabled = true;
		}

		update(); //Saves the current values of the textboxes
    }
    currentContact = contacts[currentContactIndex];
    viewCurrentContact();
}


function update(){
	currentContact.preferredName = document.getElementById("nameID").value;
	currentContact.email = document.getElementById("emailID").value;
	currentContact.city = document.getElementById("cityID").value;
	currentContact.state = document.getElementById("stateID").value;
	currentContact.zip = document.getElementById("zipID").value;
}

function add(){
	// variables
	var preSlot, emailSlot, citySlot, stateSlot, zipSlot = "";

	// giving variables a value 
	preSlot = document.getElementById("nameID").value;
	emailSlot = document.getElementById("emailID").value;
	citySlot = document.getElementById("cityID").value;
	stateSlot = document.getElementById("stateID").value;
	zipSlot = document.getElementById("zipID").value;
	
	contacts[contacts.length] = {firstName: " ", lastName: " ", preferredName: preSlot, email: emailSlot, city: citySlot, state: stateSlot, zip: zipSlot};
		
	console.log("CreateContact()");
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log('Response: ' + this.responseText);
            setStatus(this.responseText)
        }
    };
    xmlhttp.open("POST", "create-contact.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("contacts=" + JSON.stringify(contacts));    
}

function remove(contacts, currentIndex){
	var elements = contacts.indexOf(currentIndex);

	// splice function
	contacts.splice(elements, 1);
}

function removeContact(){
	var valueHolder = contacts[currentContactIndex];
	remove(contacts, valueHolder);
}

function loadIndexAndContacts() {
    var indexRequest = new XMLHttpRequest();
    indexRequest.open('GET', 'https://mustang-index.azurewebsites.net/index.json');
    indexRequest.onload = function() {
        console.log("Index JSON:" + indexRequest.responseText);
        document.getElementById("indexID").innerHTML = indexRequest.responseText;
        contactIndex = JSON.parse(indexRequest.responseText);
        for (i = 0; i < contactIndex.length; i++) {
            URLArray.push(contactIndex[i].ContactURL);
        }
        console.log("URLArray: " + JSON.stringify(URLArray));
        loadContacts();
    }
    indexRequest.send();
}
// Load Contacts function
function loadContacts() {
    contacts.length = 0;
	loadingContact = 0;
	
    if (URLArray.length > loadingContact) {
        loadNext(URLArray[loadingContact]);
    }
}
// Loads next contact in the array
function loadNext(URL) {
    contactReq = new XMLHttpRequest();
    contactReq.open('GET', URL);
    contactReq.onload = function() {
        var contact;
        contact = JSON.parse(contactReq.responseText);
        console.log("Contact: " + contact.lastName + ", " + contact.firstName);
        contacts.push(contact);
		NameArray.push(contact.lastName + ", " + contact.firstName);
		preferredName.push(contact.preferredName);
		EmailArray.push(contact.email);
		CityArray.push(contact.city);
		StateArray.push(contact.state);
		ZipArray.push(contact.zip);
        loadingContact++;
        if (URLArray.length > loadingContact) {
            loadNext(URLArray[loadingContact]);
        }
        else {
            document.getElementById("statusID").innerHTML = "Status: Contacts Loaded (" + URLArray.length + ")";
            viewCurrentContact();
			console.log(contacts);
        }
    }
    contactReq.send();
}
function viewCurrentContact() {
    currentContact = contacts[currentContactIndex];
    document.getElementById("nameID").value = currentContact.preferredName;   
    document.getElementById("emailID").value = currentContact.email;   
    document.getElementById("cityID").value = currentContact.city;   
    document.getElementById("stateID").value = currentContact.state;
    document.getElementById("zipID").value = currentContact.zip;  
    document.getElementById("statusID").innerHTML = "Viewing contact " + (currentContactIndex+1) + " of " + contacts.length;
}

function autocomplete(userInput, names) {
	// setting new variable
	var currentFocus = -1;

	userInput.addEventListener("input", function(e) {
		var x, y, i, val = this.value;

		closeLists();
		if(!val) { 
			return false;
		}
		x = document.createElement("DIV");
		x.setAttribute("id", this.id + "autocomplete-list");
		x.setAttribute("class", "autocomplete-items");
		this.parentNode.appendChild(q);

		for (i = 0; i < names.length; i++) {

			// If the name starts with the same letters as the value then this executes:
			if(names[i].substr(0, val.length).toUpperCase() == val.toUpperCase()){
				y = document.createElement("DIV");
				y.innerHTML += names[i].substr(val.length);
				y.innerHTML += "<input type='hidden' value='" + names[i] + "'>";
				y.addEventListener("click", function(e) {

				userInput.value = this.getElementsByTagName("userinput")[0].value;
				closeLists();
			});
			x.appendChild(r);
			}
		}
	});
}