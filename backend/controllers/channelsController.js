const Channel = require('../models/Channel');

async function ensureDepartmentChannelForUser(user) {
  if (!user || !user.department) return null;
  const name = String(user.department).trim();
  if (!name) return null;
  let channel = await Channel.findOne({ name });
  if (!channel) {
    channel = await Channel.create({ name, description: `${name} department`, createdBy: user.id, members: [user.id] });
  } else {
    const exists = channel.members.some(m => m.toString() === user.id);
    if (!exists) {
      channel.members.push(user.id);
      await channel.save();
    }
  }
  return channel;
}

exports.listChannels = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    await ensureDepartmentChannelForUser(user);
    const channels = await Channel.find({ members: user.id }).sort({ updatedAt: -1 });
    res.json({ channels });
  } catch (e) {
    console.error('listChannels error', e);
    res.status(500).json({ message: 'Error listing channels' });
  }
};

exports.createChannel = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    let { name = '', description = '', visibility = 'public' } = req.body;
    name = String(name).trim();
    description = String(description || '');
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const exists = await Channel.findOne({ name });
    if (exists) {
      // ensure the creator is a member
      const isMember = exists.members.some(m => m.toString() === user.id);
      if (!isMember) { exists.members.push(user.id); await exists.save(); }
      return res.status(200).json({ channel: exists, message: 'Channel already existed. You have been added.' });
    }
    const channel = await Channel.create({ name, description, visibility, createdBy: user.id, members: [user.id] });
    res.status(201).json({ channel, message: 'Channel created' });
  } catch (e) {
    console.error('createChannel error', e);
    res.status(500).json({ message: 'Error creating channel' });
  }
};

exports.getChannel = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    const isMember = channel.members.some(m => m.toString() === user.id);
    const dept = String(user.department || '').trim().toLowerCase();
    const chName = String(channel.name || '').trim().toLowerCase();
    if (!isMember) {
      if (dept && chName && dept === chName) {
        channel.members.push(user.id);
        await channel.save();
      } else {
        return res.status(403).json({ message: 'You are not a member of this channel' });
      }
    }
    res.json({ channel });
  } catch (e) {
    console.error('getChannel error', e);
    res.status(500).json({ message: 'Error fetching channel' });
  }
};
