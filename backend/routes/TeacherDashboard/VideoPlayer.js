const express = require('express');
const router = express.Router();
const { User } = require('../../models/sql/User');

const {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../../utils/http_status_codes');

/**
 * GET /api/teacher/playlists
 * Get all playlists for this teacher
 */
router.get('/', async (req, res) => {
  try {
    const teacherId = req.user.user_id;

    // Mock playlists data - in production, fetch from database
    const playlists = [
      {
        id: 1,
        name: 'Morning Yoga Basics',
        description: 'Introduction to basic yoga poses and fundamentals',
        videoCount: 5,
        totalDuration: '85 minutes',
        thumbnail:
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
        createdBy: teacherId,
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 2,
        name: 'Advanced Flow',
        description: 'Advanced yoga techniques and power postures',
        videoCount: 3,
        totalDuration: '120 minutes',
        thumbnail:
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
        createdBy: teacherId,
        createdAt: new Date('2024-02-10'),
      },
      {
        id: 3,
        name: 'Meditation & Mindfulness',
        description: 'Guided meditation and breathing exercises',
        videoCount: 4,
        totalDuration: '60 minutes',
        thumbnail:
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
        createdBy: teacherId,
        createdAt: new Date('2024-01-20'),
      },
    ];

    return res.status(HTTP_OK).json({
      status: 'success',
      data: {
        playlists,
        totalPlaylists: playlists.length,
      },
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * POST /api/teacher/playlists
 * Create a new playlist
 */
router.post('/', async (req, res) => {
  try {
    const teacherId = req.user.user_id;
    const { name, description } = req.body;

    if (!name) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: 'error',
        message: 'Missing required field: name',
        code: 'VALIDATION_ERROR',
      });
    }

    const newPlaylist = {
      id: Date.now(),
      name,
      description: description || '',
      videoCount: 0,
      totalDuration: '0 minutes',
      createdBy: teacherId,
      createdAt: new Date(),
    };

    // TODO: Save to database

    return res.status(HTTP_OK).json({
      status: 'success',
      message: 'Playlist created successfully',
      data: newPlaylist,
    });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * GET /api/teacher/playlists/:playlistId/videos
 * Get all videos in a playlist
 */
router.get('/:playlistId/videos', async (req, res) => {
  try {
    const { playlistId } = req.params;

    // Mock videos data - in production, fetch from database
    const videos = [
      {
        id: 1,
        title: 'Warm-up Exercises',
        duration: '15:30',
        thumbnail:
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
        uploadDate: '2024-01-15',
        views: 234,
        description: 'Start your yoga practice with these warm-up exercises',
      },
      {
        id: 2,
        title: 'Asana Fundamentals',
        duration: '20:15',
        thumbnail:
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4',
        uploadDate: '2024-01-16',
        views: 189,
        description: 'Learn the fundamental yoga asanas',
      },
      {
        id: 3,
        title: 'Breathing Techniques',
        duration: '12:45',
        thumbnail:
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4',
        uploadDate: '2024-01-17',
        views: 156,
        description: 'Master different breathing techniques for better practice',
      },
    ];

    return res.status(HTTP_OK).json({
      status: 'success',
      data: {
        playlistId,
        videos,
        totalVideos: videos.length,
      },
    });
  } catch (error) {
    console.error('Error fetching playlist videos:', error);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * POST /api/teacher/video-watch-history
 * Log video watch history for students
 */
router.post('/watch-history', async (req, res) => {
  try {
    const { videoId, studentId, watchedDuration, totalDuration, percentageWatched } = req.body;
    const teacherId = req.user.user_id;

    if (!videoId || !studentId || watchedDuration === undefined || totalDuration === undefined) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: 'error',
        message: 'Missing required fields',
        code: 'VALIDATION_ERROR',
      });
    }

    // TODO: Save watch history to database

    return res.status(HTTP_OK).json({
      status: 'success',
      message: 'Watch history recorded',
      data: {
        videoId,
        studentId,
        watchedDuration,
        totalDuration,
        percentageWatched: percentageWatched || Math.round((watchedDuration / totalDuration) * 100),
        recordedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error recording watch history:', error);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    });
  }
});

module.exports = router;
