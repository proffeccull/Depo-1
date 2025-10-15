import Joi from 'joi';

export const createCircle = {
  body: Joi.object({
    name: Joi.string().required().min(1).max(100),
    description: Joi.string().optional().max(500),
    isPrivate: Joi.boolean().default(false)
  })
};

export const getUserCircles = {
  query: Joi.object({
    includePrivate: Joi.boolean().default(false)
  })
};

export const joinCircle = {
  params: Joi.object({
    circleId: Joi.string().uuid().required()
  })
};

export const leaveCircle = {
  params: Joi.object({
    circleId: Joi.string().uuid().required()
  })
};

export const createPost = {
  body: Joi.object({
    content: Joi.string().required().min(1).max(2000),
    mediaUrls: Joi.array().items(Joi.string().uri()).max(10).optional(),
    circleId: Joi.string().uuid().optional()
  })
};

export const getFeed = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20)
  })
};

export const likePost = {
  params: Joi.object({
    postId: Joi.string().uuid().required()
  })
};

export const unlikePost = {
  params: Joi.object({
    postId: Joi.string().uuid().required()
  })
};

export const addComment = {
  params: Joi.object({
    postId: Joi.string().uuid().required()
  }),
  body: Joi.object({
    content: Joi.string().required().min(1).max(1000)
  })
};

export const getPostComments = {
  params: Joi.object({
    postId: Joi.string().uuid().required()
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10)
  })
};

export const sharePost = {
  params: Joi.object({
    postId: Joi.string().uuid().required()
  })
};

export const getTrendingPosts = {
  query: Joi.object({
    timeframe: Joi.string().valid('1h', '24h', '7d').default('24h'),
    limit: Joi.number().integer().min(1).max(50).default(10)
  })
};

export const search = {
  query: Joi.object({
    q: Joi.string().required().min(1).max(100),
    type: Joi.string().valid('all', 'posts', 'circles', 'users').default('all'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20)
  })
};