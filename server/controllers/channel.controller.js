import Channel from '../models/Channel.js';

export const getChannels = async (req, res, next) => {
  try {
    const channels = await Channel.find({ tenantId: req.user.tenantId });
    res.status(200).json(channels);
  } catch (error) {
    next(error);
  }
};

export const createChannel = async (req, res, next) => {
  try {
    const channelData = { ...req.body, tenantId: req.user.tenantId };
    const newChannel = new Channel(channelData);
    const savedChannel = await newChannel.save();
    res.status(201).json(savedChannel);
  } catch (error) {
    next(error);
  }
};
