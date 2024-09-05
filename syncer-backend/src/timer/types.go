package timer

import (
	"time"

	"github.com/puzpuzpuz/xsync"
)

type Timer struct {
	ClassID     string
	CurrentTime float32

	// new spec
	Ticker        *time.Ticker
	StartPosition float32 `json:"startPosition"`
	EndPosition   float32 `json:"endPosition"`

	Position     float32 `json:"position"`
	Velocity     float32 `json:"velocity"`
	Acceleration float32 `json:"acceleration"`
	LastUpdated  int64

	Done chan bool
}

type TimerMap struct {
	Map *xsync.MapOf[string, Timer]
}
