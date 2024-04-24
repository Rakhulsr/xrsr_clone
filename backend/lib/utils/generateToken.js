import jwt from "jsonwebtoken"

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }.procces.env.JWT_SECRET, {
    expireIn: "15d",
  })
}
