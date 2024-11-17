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
func AddToActionsQueue(db *mongo.Client, classID string, action events.QueueEvent) error {
	// Get the collection you want to update from
	ss, err := db.StartSession()

	if err != nil {
		return err
	}

	err = ss.StartTransaction()

	if err != nil {
		return err
	}

	collection := db.Database(os.Getenv("DB_NAME")).Collection("class_history")

	objID, _ := primitive.ObjectIDFromHex(classID)

	// Define the filter criteria (e.g., update document with specific ID)
	filter := bson.M{"_id": objID}

	// Define the update document specifying changes
	update := bson.D{
		{Key: "$push", Value: bson.D{{Key: "actions_queue", Value: action}}},
	}

	// Update the document in the collection
	result, err := collection.UpdateOne(context.TODO(), filter, update)

	if err != nil {
		err = ss.AbortTransaction(context.Background())

		if err != nil {
			return err
		}

		return err
	}

	// Check the update result
	matchedCount, modifiedCount := result.MatchedCount, result.ModifiedCount

	switch matchedCount {
	case 0:
		fmt.Println("No documents matched the filter.")
		err = ss.AbortTransaction(context.Background())

		if err != nil {
			return err
		}
		return errors.New("no documents matched the filter")
	case 1:
		fmt.Println("Successfully updated one document.")

	default:
		fmt.Printf("Unexpected update result: Matched %d documents, Modified %d documents\n", matchedCount, modifiedCount)
		err = ss.AbortTransaction(context.Background())

		if err != nil {
			return err
		}

		return errors.New("unexpected update result")
	}

	err = ss.CommitTransaction(context.Background())

	if err != nil {
		return err
	}

	return nil
}

func GetQueueEventsSince(db *mongo.Client, classID string, _ time.Time) ([]events.QueueEvent, error) {
	// get records from the db
	ss, err := db.StartSession()

	if err != nil {
		return nil, err
	}

	err = ss.StartTransaction()

	if err != nil {
		return nil, err
	}

	collection := db.Database(os.Getenv("DB_NAME")).Collection("class_history")

	objID, _ := primitive.ObjectIDFromHex(classID)

	// Define the filter criteria (e.g., update document with specific ID)
	filter := bson.M{"_id": objID}

	opts := options.FindOneOptions{}

	opts.SetProjection(bson.M{"actions_queue": 1})

	res := collection.FindOne(context.TODO(), filter, &opts)

	classModel := ClassModel{}

	err = res.Decode(&classModel)

	if err != nil {
		err = ss.AbortTransaction(context.Background())

		if err != nil {
			return nil, err
		}

		return nil, err
	}

	err = ss.CommitTransaction(context.Background())

	if err != nil {
		return nil, err
	}

	return classModel.ActionsQueue, nil
}

func AddToControlsQueue(db *mongo.Client, classID string, action events.ControlsEvent) error {
	// Get the collection you want to update from
	collection := db.Database("db_name").Collection("class")

	objID, _ := primitive.ObjectIDFromHex(classID)

	// Define the filter criteria (e.g., update document with specific ID)
	filter := bson.M{"_id": objID}

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
