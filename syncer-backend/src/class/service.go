package class

import (
	"context"
	"errors"
	"fmt"
	"os"
	"syncer-backend/src/events"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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

	collection := db.Database(os.Getenv("DB_NAME")).Collection("class_history")

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

func GetQueueEventsSince(db *mongo.Client, classId string, maxTime time.Time) ([]events.QueueEvent, error) {
	// get records from the db
	ss, err := db.StartSession()

	if err != nil {
		return nil, err
	}

	ss.StartTransaction()

	collection := db.Database(os.Getenv("DB_NAME")).Collection("class_history")

	objId, _ := primitive.ObjectIDFromHex(classId)

	// Define the filter criteria (e.g., update document with specific ID)
	filter := bson.M{"_id": objId}

	opts := options.FindOneOptions{}

	opts.SetProjection(bson.M{"actions_queue": 1})

	res := collection.FindOne(context.TODO(), filter, &opts)

	classModel := ClassModel{}

	err = res.Decode(&classModel)

	if err != nil {
		ss.AbortTransaction(context.Background())
		return nil, err
	}

	ss.CommitTransaction(context.Background())

	return classModel.ActionsQueue, nil
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
