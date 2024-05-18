package timer

import (
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

func (t TimerMap) UpdateTime(classId string, duration float32, eventTime int64) {
	ct, ok := t.Map.Load(classId)

	if !ok {
		t.Map.Store(classId, Timer{
			CurrentTime: duration,
			LastUpdated: eventTime,
		})
	} else {
		// skip out of order events
		if ct.LastUpdated >= eventTime {
			return
		}

		ct.CurrentTime = duration
		t.Map.Store(classId, ct)
	}
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
