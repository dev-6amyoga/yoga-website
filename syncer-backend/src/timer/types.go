package timer

import (
	"github.com/puzpuzpuz/xsync"
)

type Timer struct {
	CurrentTime float64
	LastUpdated int64
}

type TimerMap struct {
	Map *xsync.MapOf[string, Timer]
}
