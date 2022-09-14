import express from "express"
import fetch from "node-fetch"
import bodyParser from "body-parser"
import cors from "cors"

// create express app
const app = express();

//cors policy
app.use(cors())

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

app.get('/getcontact', (req,res) => {
    var query = `query GetContactList (
        $distinct_on: [contact_select_column!], 
        $limit: Int, 
        $offset: Int, 
        $order_by: [contact_order_by!], 
        $where: contact_bool_exp
    ) {
      contact(
          distinct_on: $distinct_on, 
          limit: $limit, 
          offset: $offset, 
          order_by: $order_by, 
          where: $where
      ){
        created_at
        first_name
        id
        last_name
        phones {
          number
        }
      }
    }`;

    fetch('https://wpe-hiring.tokopedia.net/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query,
        variables: { 
            "limit" : Number(req.query.limit),
            "offset" : Number(req.query.offset),
            "order_by" : {
                "id" : "desc"
            }
        },
    })
    })
    .then(r => r.json())
    .then(data => res.json(data));
});

app.post('/addcontact', (req,res) => {
    var query = `mutation AddContactWithPhones(
        $first_name: String!, 
        $last_name: String!, 
        $phones: [phone_insert_input!]!
        ) {
      insert_contact(
          objects: {
              first_name: $first_name, 
              last_name: 
              $last_name, phones: { 
                  data: $phones
                }
            }
        ) {
        returning {
          first_name
          last_name
          id
          phones {
            number
          }
        }
      }
    }`;

    fetch('https://wpe-hiring.tokopedia.net/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query,
        variables: req.body,
    })
    })
    .then(r => r.json())
    .then(data => res.json(data));
});

app.post('/editcontact', (req,res) => {
    var query = `mutation EditContactById($id: Int!, $_set: contact_set_input) {
        update_contact_by_pk(pk_columns: {id: $id}, _set: $_set) {
          id
          first_name
          last_name
          phones {
            number
          }
        }
      }`;

    fetch('https://wpe-hiring.tokopedia.net/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query,
        variables: {
            "id": req.body.id, 
            "_set": {
                "first_name": req.body.data.first_name,
                "last_name": req.body.data.last_name
            }
        },
    })
    })
    .then(r => r.json())
    .then(data => res.json(data));
});

app.post('/addnumber', (req,res) => {
    var query = `mutation AddNumberToContact ($contact_id: Int!, $phone_number:String!) {
        insert_phone(objects: {contact_id: $contact_id, number: $phone_number}) {
          returning {
            contact {
              id
              last_name
              first_name
              phones {
                number
              }
            }
          }
        }
      }`;

    fetch('https://wpe-hiring.tokopedia.net/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query,
        variables: {
            "contact_id": req.body.id,
            "phone_number": req.body.phone_number
        },
    })
    })
    .then(r => r.json())
    .then(data => res.json(data));
});

app.post('/editnumber', (req,res) => {
    var query = `mutation EditPhoneNumber($pk_columns: phone_pk_columns_input!, $new_phone_number:String!) {
        update_phone_by_pk(pk_columns: $pk_columns, _set: {number: $new_phone_number}) {
          contact {
            id
            last_name
            first_name
            created_at
            phones {
              number
            }
          }
        }
      }`;

    fetch('https://wpe-hiring.tokopedia.net/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query,
        variables: {
            "pk_columns": {
                "number": req.body.old_number,
                "contact_id": req.body.id
            },
            "new_phone_number": req.body.new_number
        },
    })
    })
    .then(r => r.json())
    .then(data => res.json(data));
});

app.post('/deletecontact', (req,res) => {
    var query = `mutation MyMutation($id: Int!) {
        delete_contact_by_pk(id: $id) {
          first_name
          last_name
          id
        }
      }`;

    fetch('https://wpe-hiring.tokopedia.net/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query,
        variables: {
            "id": req.body.id,
        },
    })
    })
    .then(r => r.json())
    .then(data => res.json(data));
});
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000');