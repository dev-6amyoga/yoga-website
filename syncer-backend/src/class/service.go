package class

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewClass() (*ClassModel, error) {
	return nil, nil
}

// add to mongo db
func AddToActionsQueue(db *mongo.Client, classId string, action string) error {
	// Get the collection you want to update from
	collection := db.Database("db_name").Collection("class")

	objId, _ := primitive.ObjectIDFromHex(classId)

	// Define the filter criteria (e.g., update document with specific ID)
	filter := bson.M{"_id": objId}

	// Define the update document specifying changes
	update := bson.D{
		{Key: "$push", Value: bson.D{{Key: "actions_queue", Value: action}}},
	}

	// Update the document in the collection
	result, err := collection.UpdateOne(context.TODO(), filter, update)

	if err != nil {
		return err
	}

	// Check the update result
	matchedCount, modifiedCount := result.MatchedCount, result.ModifiedCount
	if matchedCount == 0 {
		fmt.Println("No documents matched the filter.")
	} else if modifiedCount == 1 {
		fmt.Println("Successfully updated one document.")
	} else {
		fmt.Printf("Unexpected update result: Matched %d documents, Modified %d documents\n", matchedCount, modifiedCount)
	}

	return nil
}

func AddToControlsQueue(db *mongo.Client, classId string, action string) error {
	// Get the collection you want to update from
	collection := db.Database("db_name").Collection("class")

	objId, _ := primitive.ObjectIDFromHex(classId)

	// Define the filter criteria (e.g., update document with specific ID)
	filter := bson.M{"_id": objId}

	// Define the update document specifying changes
	update := bson.D{
		{Key: "$push", Value: bson.D{{Key: "controls_queue", Value: action}}},
	}

	// Update the document in the collection
	result, err := collection.UpdateOne(context.TODO(), filter, update)

	if err != nil {
		return err
	}

	// Check the update result
	matchedCount, modifiedCount := result.MatchedCount, result.ModifiedCount
	if matchedCount == 0 {
		fmt.Println("No documents matched the filter.")
	} else if modifiedCount == 1 {
		fmt.Println("Successfully updated one document.")
	} else {
		fmt.Printf("Unexpected update result: Matched %d documents, Modified %d documents\n", matchedCount, modifiedCount)
	}

	return nil
}
