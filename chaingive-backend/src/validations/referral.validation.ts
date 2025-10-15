import Joi from 'joi';

export const applyReferralCodeSchema = Joi.object({
  referralCode: Joi.string()
    .length(10)
    .uppercase()
    .required()
    .messages({
      'string.length': 'Referral code must be exactly 10 characters',
      'string.uppercase': 'Referral code must be uppercase',
    }),
});
