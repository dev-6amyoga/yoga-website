package server

func valueOrDefaultFloat32(value *float32, defaultValue float32) float32 {
	if value == nil {
		return defaultValue
	}
	return *value
}
