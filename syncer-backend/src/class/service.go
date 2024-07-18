package class

import (
	"context"
	"errors"
	"fmt"
	"os"
	"syncer-backend/src/events"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewClass() (*ClassModel, error) {
	return nil, nil
}

// add to mongo db
func AddToActionsQueue(db *mongo.Client, classId string, action events.QueueEvent) error {
	// Get the collection you want to update from
	ss, err := db.StartSession()

	if err != nil {
		return err
	}

	ss.StartTransaction()

	collection := db.Database(os.Getenv("DB_NAME")).Collection("class_mode")

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
		ss.AbortTransaction(context.Background())
		return err
	}

	// Check the update result
	matchedCount, modifiedCount := result.MatchedCount, result.ModifiedCount
	if matchedCount == 0 {
		fmt.Println("No documents matched the filter.")
		ss.AbortTransaction(context.Background())
		return errors.New("no documents matched the filter")
	} else if modifiedCount == 1 {
		fmt.Println("Successfully updated one document.")
	} else {
		fmt.Printf("Unexpected update result: Matched %d documents, Modified %d documents\n", matchedCount, modifiedCount)
		ss.AbortTransaction(context.Background())
		return errors.New("unexpected update result")
	}

	ss.CommitTransaction(context.Background())
	return nil
}

func AddToControlsQueue(db *mongo.Client, classId string, action events.ControlsEvent) error {
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
