package wssyncer

import (
	"syncer-backend/src/events"
	"syncer-backend/src/models"
	"syncer-backend/src/timer"

	"github.com/puzpuzpuz/xsync"
	"go.mongodb.org/mongo-driver/mongo"
)

type WsServer struct {
	// socker server instance

	// Endpointer
	Endpoints models.EndpointInterface
}

type WsEndpoints struct {
	// timers for each class
	Timers timer.TimerMap

	// update channels map for each classID with a channel for each joinee
	// {classID: {userId: chan float32}}
	UpdateChannels *xsync.MapOf[string, *xsync.MapOf[string, chan events.TimerEventResponse]]

	Dao models.DaoInterface
}

type WsDao struct {
	// mongo connector
	dbClient *mongo.Client
}
