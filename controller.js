const bcrypt = require('bcryptjs')

module.exports = {
    getAllGalleries: (req, res, next) => {
        // offset variable destructured from params to be passed as offset in query
        const { offset } = req.params
        // get all galleries for non-registered users.
        const db = req.app.get('db')
        db.get_all_public_galleries([offset]).then(galleries => {
            res.status(200).send(galleries)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    addToFavorites: (req, res, next) => {
        let { galleryId } = req.body
        // data contains userid
        let { data } = req.session
        const db = req.app.get('db')
        db.add_to_favorites([data, galleryId]).then(favorited => {
            res.status(200).send(favorited)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    deleteFromFavorites: (req, res, next) => {
        let { galleryId } = req.params
        // data contains user id
        let { data } = req.session
        const db = req.app.get('db')
        db.delete_from_favorites([data, galleryId]).then(deleted => {
            res.status(200).send(deleted)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    adjustGalleryFavorites: (req, res, next) => {
        let { galleryId } = req.params
        const { Increase, Decrease } = req.body
        const db = req.app.get('db')
        if (Increase) {
            db.increase_gallery_favorites([galleryId]).then(gallery => {
                res.status(200).send(gallery)
            }).catch(err => {
                console.log(err)
                res.status(500).send(err)
            })
        } else if (Decrease) {
            db.decrease_gallery_favorites([galleryId]).then(gallery => {
                res.status(200).send(gallery)
            }).catch(err => {
                console.log(err)
                res.status(500).send(err)
            })
        }

    },
    searchGalleries: (req, res, next) => {
        const { search } = req.query
        const db = req.app.get('db')
        db.get_gallery_by_search([search]).then(results => {
            res.status(200).send(results)
        }).catch(err => {
            console.log(err)
            res.status(err)
        })
    },
    getAccountInfo: (req, res, next) => {
        let { user } = req.session
        const db = req.app.get('db')
        db.get_account_info([user]).then(accountInfo => {
            res.status(200).send(accountInfo)
        }).catch(err => {
            console.log(err)
            res.status(err)
        })
    },
    incrementView: (req, res, next) => {
        let { galleryId } = req.params
        const db = req.app.get('db')
        db.increment_view([galleryId]).then(view => {
            res.status(200).send(view)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    incrementShare: (req, res, next) => {
        const { galleryId } = req.params
        const db = req.app.get('db')
        db.increment_share([galleryId]).then(share => {
            res.status(200).send(share)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    registerUser: (req, res, next) => {
        let { firstName, lastName, username, email, password } = req.body
        //Salt and Hash password
        const salt = bcrypt.genSaltSync(10)
        const passwordHashed = bcrypt.hashSync(password, salt)
        //Check for existing email address and username. If both are false, then register new user.
        const db = req.app.get('db')
        db.check_email([email]).then(user => {
            if (user[0]) {
                res.status(200).send('email')
            } else {
                db.check_username([username]).then(user => {
                    if (user[0]) {
                        res.status(200).send('username')
                    } else {
                        db.register_user([username, passwordHashed, email, firstName, lastName]).then(user => {
                            res.status(200).send('success')
                        }).catch(err => {
                            console.log(err)
                            res.status(500).send(err)
                        })
                    }
                }).catch(err => {
                    console.log(err)
                    res.status(500).send(err)
                })
            }
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    login: (req, res, next) => {
        let { username, password } = req.body
        const db = req.app.get('db')
        db.check_user_login([username]).then(user => {
            //if username exists, the array will have a length
            if (user.length) {
                const validPassword = bcrypt.compareSync(password, user[0].password)
                //if the password is correct, validPassword will become truthy
                if (validPassword) {
                    req.session.user = user[0].username
                    req.session.data = user[0].id

                    res.status(200).send(user[0])
                } else {
                    //if password is incorrect, validPassword would be falsy and send wrong password.
                    res.status(200).send('Wrong Password')
                }
            } else {
                //if the above doesn't work, then the username does not exist.
                res.status(200).send('Wrong Username')
            }
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    getGalleryData: (req, res, next) => {
        let { username, galleryName } = req.params
        const db = req.app.get('db')
        db.get_gallery_data([galleryName, username]).then(images => {
            res.status(200).send(images)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    getRandomGallery: (req, res, next) => {
        const db = req.app.get('db')
        db.get_random_gallery().then(randoGallery => {
            res.status(200).send(randoGallery)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    checkUser: (req, res, next) => {
        const { user } = req.session
        res.status(200).send(user)
    },
    retrieveGalleries: (req, res, next) => {
        const { user } = req.session
        const db = req.app.get('db')
        db.get_gallery_info([user]).then(galleries => {
            res.status(200).send(galleries)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    getFavorites: (req, res, next) => {
        const { user } = req.session
        const db = req.app.get('db')
        db.get_favorites([user]).then(favorites => {
            res.status(200).send(favorites)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    createNewGallery: (req, res, next) => {
        // Need to add in array of stuff
        const { author, isPrivate, galleryName, thumbnail, finalImages, finalCaptions, finalGalleryPresets } = req.body
        // data is user.id
        const { data } = req.session
        const db = req.app.get('db')
        db.create_new_gallery([galleryName, thumbnail, isPrivate, author, data, finalGalleryPresets[0], finalGalleryPresets[1], finalGalleryPresets[2], finalGalleryPresets[3], finalImages[0], finalImages[1], finalImages[2], finalImages[3], finalImages[4], finalImages[5], finalImages[6], finalImages[7], finalImages[8], finalImages[9], finalImages[10], finalImages[11], finalImages[12], finalImages[13], finalImages[14], finalCaptions[0], finalCaptions[1], finalCaptions[2], finalCaptions[3], finalCaptions[4], finalCaptions[5], finalCaptions[6], finalCaptions[7], finalCaptions[8], finalCaptions[9], finalCaptions[10], finalCaptions[11], finalCaptions[12], finalCaptions[13], finalCaptions[14]]).then(newGallery => {
            res.status(200).send(newGallery)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    getGalleryToEdit: (req, res, next) => {
        const { id } = req.params
        const db = req.app.get('db')
        db.get_gallery_to_edit(id).then(galleryData => {
            res.status(200).send(galleryData)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    updateGallery: (req, res, next) => {
        const { galleryId } = req.params
        const { isPrivate, galleryName, thumbnail, finalImages, finalCaptions, finalGalleryPresets } = req.body
        const db = req.app.get('db')
        db.update_gallery([galleryId, isPrivate, galleryName, thumbnail, finalGalleryPresets[0], finalGalleryPresets[1], finalGalleryPresets[2], finalGalleryPresets[3], finalImages[0], finalImages[1], finalImages[2], finalImages[3], finalImages[4], finalImages[5], finalImages[6], finalImages[7], finalImages[8], finalImages[9], finalImages[10], finalImages[11], finalImages[12], finalImages[13], finalImages[14], finalCaptions[0], finalCaptions[1], finalCaptions[2], finalCaptions[3], finalCaptions[4], finalCaptions[5], finalCaptions[6], finalCaptions[7], finalCaptions[8], finalCaptions[9], finalCaptions[10], finalCaptions[11], finalCaptions[12], finalCaptions[13], finalCaptions[14]]).then(redirect => {
            res.status(200).send(redirect)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    deleteGallery: (req, res, next) => {
        const { id } = req.params
        const db = req.app.get('db')
        db.delete_gallery([id])
        res.sendStatus(200)
    },
    confirmPassword: (req, res, next) => {
        const { passwordConfirm, username } = req.params
        const db = req.app.get('db')
        db.confirm_password([username]).then(password => {
            if (bcrypt.compareSync(passwordConfirm, password[0].password)) {
                res.sendStatus(200)
            } else {
                res.status(200).send('incorrect')
            }
        })
    },
    changeUsername: (req, res, next) => {
        const { newUsername, username } = req.body
        const db = req.app.get('db')
        db.check_username([newUsername]).then(user => {
            if (user[0]) {
                res.status(200).send('username')
            } else {
                db.change_username([username, newUsername]).then(changedUsername => {
                    res.status(200).send(changedUsername)
                }).catch(err => {
                    console.log(err)
                    res.status(500).send(err)
                })
            }
        })
    },
    changeEmail: (req, res, next) => {
        const { newEmail, username } = req.body
        const db = req.app.get('db')
        db.check_email([newEmail]).then(email => {
            if (email[0]) {
                res.status(200).send('email')
            } else {
                db.change_email([username, newEmail]).then(changedEmail => {
                    res.status(200).send(changedEmail)
                }).catch(err => {
                    console.log(err)
                    res.status(500).send(err)
                })
            }
        })
    },
    findEmail: (req, res, next) => {
        const { email } = req.params
        const db = req.app.get('db')
        db.find_email([email]).then(email => {
            res.status(200).send(email.length ? email : [])
        })
    },
    changePassword: (req, res, next) => {
        const { newPassword, username } = req.body
        const salt = bcrypt.genSaltSync(10)
        const passwordHashed = bcrypt.hashSync(newPassword, salt)
        const { user } = req.session
        const db = req.app.get('db')
        db.change_password([username, passwordHashed]).then(success => {
            res.sendStatus(200)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    changeAvatar: (req, res, next) => {
        const { imageAddress, username } = req.body
        const db = req.app.get('db')
        db.change_avatar([username, imageAddress]).then(changedAvatar => {
            res.status(200).send(changedAvatar)
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    getThoseWhoLiked: (req, res, next) => {
        const { galleryIds } = req.query
        //checks if user has any galleries to begin with
        if (galleryIds.length) {
            // converting strings into numeric values to be passed
            let galleryIdsArray = galleryIds.split(',')
            const db = req.app.get('db')
            db.users_who_like_your_galleries([galleryIdsArray]).then(followers => {
                res.status(200).send(followers)
            }).catch(err => {
                console.log(err)
                res.status(500).send(err)
            })
        }
        // if user has no galleries send back an empty array
        else res.status(200).send([])
    },
    deleteAccount: (req,res,next) => {
        const {username} = req.params
        const db = req.app.get('db')
        db.delete_account([username]).then(deletedAccount => {
            res.status(200).send('deleteAccount')
        }).catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    },
    logout: (req, res, next) => {
        req.session.destroy()
        res.sendStatus(200)
    }
}