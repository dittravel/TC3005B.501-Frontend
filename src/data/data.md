**attend-travel-request/{userId}**

method: PUT

"200":
    description: Attend a travel request

"400":
    description: Invalid input data

"404":
    description: Travel request not found

"500":
    description: Internal server error


**/authorize-travel-request/{userId}**

method: PUT

 "200": 
    description: List of travel requests

"401":
    description: Unauthorized

"500":
    description: Internal server error

**/create-expense-validation**

method: POST

"201":
    description: Expense validation successfully created

"400":
    description: Invalid input

"404":
    description: Receipt not found

"500":
    description: Internal server error

**/create-travel-request**

Method:POST

"201":
    description: Object created

"400":
          description: Invalid input

"500":
    description: Internal server error 

**/decline-travel-request/{userId}**

Method: PUT

"200": 
    description: List of travel requests
  
"401":
    description: Unauthorized

"500":
    description: Internal server error


**/edit-travel-request/{}**

"200":
description: Travel request successfully updated
    
"400":
    description: Invalid input data

"404":
    description: Travel request not found

"500":
    description: Internal server error

**/get-cc/{userId}**

method: GET

"200":
    description: Cost center and department name of the 

"404":
    description: User or department not found

"500":
    description: Internal server error

**/get-alerts/{userId}/{n}**

method:GET

"200": 
description: List of travel requests
    
"401":
    description: Unauthorized

"500":
    description: Internal server error

**/get-completed-requests/{userId}**

method:get

"200":
    description: List of completed travel requests for the user
    
"404":
    description: No completed requests found for the user

"500":
    description: Internal server error


**/get-travel-request/{userId}**

method:get

"200": 
    description: List of travel requests

"401":
    description: Unauthorized

"500":
    description: Internal server error


**/get-travel-requests/{dept}/{status}/{n}**

Method: GET

"200": 
    description: List of travel requests

"401":
    description: Unauthorized

"500":
    description: Internal server error

**/get-user/{userId}**

Method:GET

"200":
description: User information
    
"401":
    description: Invalid or missing authentication token

"500":
    description: Internal server error

**/get-user-data/{userId}**

Method: GET

"200":
    description: All User's data

"401":
    description: Invalid or missing authentication token

"404":
    description: No information found for the user

"500":
    description: Internal server error

**/get-user-request/{}**

method: GET

"200":
    description: Travel request full data

"404":
    description: Travel request not found

"500":
    description: Internal server error

**/get-user-requests/{userId}/{status}**

Mehtod:get

"200":
    description: List of travel requests in selected status

"401":
    description: Unauthorized

"500":
    description: Internal server error

