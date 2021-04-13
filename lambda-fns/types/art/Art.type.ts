import { Field, ObjectType } from "type-graphql";

@ObjectType()
export default class Art {
    @Field()
    id: string
    
    @Field()
    title: string;
    
    @Field()
    network: string;
    
    @Field()
    contractID: string;
    
    @Field()
    asset: string;
    
    @Field()
    quantity: string;
}

