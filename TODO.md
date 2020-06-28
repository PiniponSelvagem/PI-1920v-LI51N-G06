# TODO

### Group Invites

* See pending invites on group menu :
    ```
    GET /series/group/:gid/invites
    {
        "result":
                "results": [
                    {
                        "id":   Invite Id,
                        "from": Current User,
                        "to" :  User Invited
                    }
                ]
    }
    ```
    * Try Get Group
    * Get all Invites from DB that match the Group Id :
        ```
        GET /cota-invites/_search?q=groupId:groupId
        {
            "hits": {
                "total": {
                    "value": Total Number of Reuslts,
                    "relation": "eq"
                },
                    "hits": [invites]
                }
        }
        ```
    * Return mapped invites array


* Invite collaborators to group on the group menu : 
    ```
    POST /series/group/:gid/invites
    {
        "to": User to Invite
    }
    ```
    * Try Get User
    * Try Get Group
    * Add Invite to DB :
        ```
        POST cota/invite/_doc
        {
            "groupId": Group Id,
            "from":    Current User,
            "to" :     User invited
        }
        ```
    * Return new invite list for the given group

* Cancel pending invite on group menu :
    ```
    POST /series/group/:gid/invites
    {
        "id": Invite Id
    }
    ```
    * Try Get Group
    * Delete Invite from DB that matches "id" and "groupId" :
        ```
        POST /cota-invites/_update/:id
        {
            "script" : {
                "source": "if (ctx._source.groupId == params.groupId) { ctx.op = 'delete'} else{ ctx.op = 'none'}",
                "params" : {
                    "groupId" : Group Id
                }
            }
        }
        ```
    * If error => Invite not found
    * If result != "deleted" => Group Id doesn't match Invite
    * Return new invite list for the given group

* See pending group invites for User on the invites Tab :
    ```
    GET /invites
    {
        "result":{
            "results": [
                {
                    "id":      inviteId
                    "groupId": groupId
                    "from":    current User username
                }
            ]
        }
    }
    ```
    * Get all Invites from DB that match "to == username" :
        ```
        GET /cota-invites/_search?q=to:username
        {
            "hits": {
                "total": {
                    "value": Total Number of Reuslts,
                    "relation": "eq"
                },
                    "hits": [invites]
                }
        }
        ```
    * Return mapped invites array

* Accept/Decline invite :
    ```
    POST /invites/:id
    {
        "accept": true/false
    }
    ```
    * Get Invite from DB that matches "id" :
        ```
        GET /cota-invites/_doc/:id
        {
            "_id": Invite Id,
            "found": true/false,
            "_source": {
                "groupId": Group Id,
                "from": User that Invited,
                "to": Invited User
            }
        }
        ```
    * Check if "found" == true and "to" == user, otherwise, throw No Acess error
    * Check "accept":
        * true:  
            * Add User to Group specified in the Invite
                ```
                POST /cota-groups/_update/:id
                {
                    script: {
                        inline: "ctx._source.collaborators.add(params.user)",
                        params: { user: New User }
                    }
                }
                ```
            * Delete Invite from DB that matches "id" :
                ```
                DELETE /cota-invites/_doc/:id
                {
                    "result": "deleted/not_found",
                }
                ```
            * Return new Invite List
        * false:
            * Delete Invite that matches "id"
                ``` 
                (Same as Above)
                ```
            * Return new Invite List
