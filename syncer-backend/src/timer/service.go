package timer

import (
	"errors"

	"github.com/puzpuzpuz/xsync"
)

func NewTimerMap() TimerMap {
	return TimerMap{
		Map: xsync.NewMapOf[Timer](),
	}
}

func (t TimerMap) AddTimer(classId string, duration float32) {
	t.Map.Store(classId, Timer{
		CurrentTime: duration,
	})
}

func (t TimerMap) UpdateTime(classId string, duration float32, eventTime int64) error {
	ct, ok := t.Map.Load(classId)

	if !ok {
		t.Map.Store(classId, Timer{
			CurrentTime: duration,
			LastUpdated: eventTime,
		})
	} else {
		// skip out of order events
		if ct.LastUpdated >= eventTime {
			return errors.New("out of order event")
		}

		ct.CurrentTime = duration
		t.Map.Store(classId, ct)
	}

	return nil
}

func (t TimerMap) GetTime(classId string) float32 {
	ct, ok := t.Map.Load(classId)

	if !ok {
		return -1
	}

	return ct.CurrentTime
}

func (t TimerMap) DeleteTimer(classId string) {
	t.Map.Delete(classId)
}
