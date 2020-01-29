import { Client } from '@textile/threads-client';

export class QuantumKernel {
  public client: Client;
  public storeId: string | undefined;
  public person1ID: any;
  public person2ID: any;

  constructor() {
    // this.client = new Client("http://localhost:7006");
    this.client = new Client('http://81.169.194.192:7006');
  }

  public async start() {
    const result = await this.client.newStore();
    this.storeId = result.id;
    this.client.registerSchema(this.storeId, "person", this.personSchema);
    await this.client.start(this.storeId);

    // Adding two persons
    const response = await this.client.modelCreate(this.storeId, "person", [
      {
        age: 1,
        firstName: "first",
        lastName: "person"
      },
      {
        age: 1,
        firstName: "second",
        lastName: "person"
      }
    ])

    this.person1ID = response.entitiesList[0].ID;
    this.person2ID = response.entitiesList[1].ID;

    this.client.listen(this.storeId, "person", this.person1ID, this.listenPerson1.bind(this));
    this.client.listen(this.storeId, "person", this.person2ID, this.listenPerson2.bind(this));


    const person1 = (await this.client.modelFindByID(this.storeId, "person", this.person1ID)).entity;
    const person2 = (await this.client.modelFindByID(this.storeId, "person", this.person2ID)).entity;

    person1.age++;
    await this.client.modelSave(this.storeId, "person", [person1]);

    person2.age++;
    await this.client.modelSave(this.storeId, "person", [person2]);

  }

  listenPerson1(result: any) {
    console.log("listenPerson1", result);
    console.log("person ID", this.person1ID)
    console.log("result ID", result.entity.ID)
  }
  listenPerson2(result: any) {
    console.log("listenPerson2", result);
    console.log("person ID", this.person2ID)
    console.log("result ID", result.entity.ID)
  }

  private get personSchema() {
    return {
      "$id": "https://example.com/person.schema.json",
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Person",
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string",
          "description": "The person's first name."
        },
        "lastName": {
          "type": "string",
          "description": "The person's last name."
        },
        "age": {
          "description": "Age in years which must be equal to or greater than zero.",
          "type": "number",
          "minimum": 0
        }
      }
    };
  }
}
