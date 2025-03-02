package wssyncer

import (
	"context"
	"os"
	"syncer-backend/src/class"
	"syncer-backend/src/events"
	"syncer-backend/src/models"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

func NewDao() models.DaoInterface {
	log := zap.S()

	// mongo connector
	bsonOpts := &options.BSONOptions{
		UseJSONStructTags: true,
		NilSliceAsEmpty:   true,
	}

	client, err := mongo.Connect(
		context.Background(),
		options.Client().ApplyURI(os.Getenv("DB_URL")).SetBSONOptions(bsonOpts),
	)

	if err != nil {
		log.Errorf("Error connecting to MongoDB: %s", err)
		panic(err)
	}

	// Check if the connection was successful
	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Errorf("Error pinging MongoDB: %s", err)
		panic(err)
	}

	return &WsDao{
		dbClient: client,
	}
}

func (d *WsDao) AddToActionsQueue(
	classID string,
	action *events.QueueEvent,
) error {
	return class.AddToActionsQueue(d.dbClient, classID, action)
}
