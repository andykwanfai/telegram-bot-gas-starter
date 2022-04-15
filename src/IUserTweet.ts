export enum TweetMediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
}

export interface ITweetMedia {
  display_url: string
  expanded_url: string
  id_str: string
  indices: Array<number>
  media_key: string
  media_url_https: string
  type: TweetMediaType;
  url: string
  ext_media_color: {
    palette: Array<{
      percentage: number
      rgb: {
        blue: number
        green: number
        red: number
      }
    }>
  }
  ext_media_availability: {
    status: string
  }
  features: {
    large?: {
      faces: Array<{
        x: number
        y: number
        h: number
        w: number
      }>
    }
    medium?: {
      faces: Array<{
        x: number
        y: number
        h: number
        w: number
      }>
    }
    small?: {
      faces: Array<{
        x: number
        y: number
        h: number
        w: number
      }>
    }
    orig?: {
      faces: Array<{
        x: number
        y: number
        h: number
        w: number
      }>
    }
  }
  sizes: {
    large: {
      h: number
      w: number
      resize: string
    }
    medium: {
      h: number
      w: number
      resize: string
    }
    small: {
      h: number
      w: number
      resize: string
    }
    thumb: {
      h: number
      w: number
      resize: string
    }
  }
  original_info: {
    height: number
    width: number
    focus_rects?: Array<{
      x: number
      y: number
      w: number
      h: number
    }>
  }
  additional_media_info?: {
    monetizable: boolean
  }
  mediaStats?: {
    viewCount: number
  }
  video_info?: {
    aspect_ratio: Array<number>
    duration_millis: number
    variants: Array<{
      bitrate?: number
      content_type: string
      url: string
    }>
  }
}

export interface ITweetEntry {
  entryId: string
  sortIndex: string
  content: {
    entryType: string
    itemContent: {
      itemType: string
      tweet_results: {
        result: {
          __typename: string
          rest_id: string
          core: {
            user_results: {
              result: {
                __typename: string
                id: string
                rest_id: string
                affiliates_highlighted_label: {}
                has_nft_avatar: boolean
                legacy: {
                  created_at: string
                  default_profile: boolean
                  default_profile_image: boolean
                  description: string
                  entities: {
                    description: {
                      urls: Array<any>
                    }
                    url: {
                      urls: Array<{
                        display_url: string
                        expanded_url: string
                        url: string
                        indices: Array<number>
                      }>
                    }
                  }
                  fast_followers_count: number
                  favourites_count: number
                  followers_count: number
                  friends_count: number
                  has_custom_timelines: boolean
                  is_translator: boolean
                  listed_count: number
                  location: string
                  media_count: number
                  name: string
                  normal_followers_count: number
                  pinned_tweet_ids_str: Array<any>
                  profile_banner_extensions: {
                    mediaColor: {
                      r: {
                        ok: {
                          palette: Array<{
                            percentage: number
                            rgb: {
                              blue: number
                              green: number
                              red: number
                            }
                          }>
                        }
                      }
                    }
                  }
                  profile_banner_url: string
                  profile_image_extensions: {
                    mediaColor: {
                      r: {
                        ok: {
                          palette: Array<{
                            percentage: number
                            rgb: {
                              blue: number
                              green: number
                              red: number
                            }
                          }>
                        }
                      }
                    }
                  }
                  profile_image_url_https: string
                  profile_interstitial_type: string
                  protected: boolean
                  screen_name: string
                  statuses_count: number
                  translator_type: string
                  url: string
                  verified: boolean
                  withheld_in_countries: Array<any>
                }
                super_follow_eligible: boolean
                super_followed_by: boolean
                super_following: boolean
              }
            }
          }
          unmention_info: {}
          legacy: {
            created_at: string
            conversation_id_str: string
            display_text_range: Array<number>
            entities: {
              media?: Array<{
                display_url: string
                expanded_url: string
                id_str: string
                indices: Array<number>
                media_url_https: string
                type: string
                url: string
                features: {
                  large?: {
                    faces: Array<{
                      x: number
                      y: number
                      h: number
                      w: number
                    }>
                  }
                  medium?: {
                    faces: Array<{
                      x: number
                      y: number
                      h: number
                      w: number
                    }>
                  }
                  small?: {
                    faces: Array<{
                      x: number
                      y: number
                      h: number
                      w: number
                    }>
                  }
                  orig?: {
                    faces: Array<{
                      x: number
                      y: number
                      h: number
                      w: number
                    }>
                  }
                }
                sizes: {
                  large: {
                    h: number
                    w: number
                    resize: string
                  }
                  medium: {
                    h: number
                    w: number
                    resize: string
                  }
                  small: {
                    h: number
                    w: number
                    resize: string
                  }
                  thumb: {
                    h: number
                    w: number
                    resize: string
                  }
                }
                original_info: {
                  height: number
                  width: number
                  focus_rects?: Array<{
                    x: number
                    y: number
                    w: number
                    h: number
                  }>
                }
              }>
              user_mentions: Array<{
                id_str: string
                name: string
                screen_name: string
                indices: Array<number>
              }>
              urls: Array<{
                display_url: string
                expanded_url: string
                url: string
                indices: Array<number>
              }>
              hashtags: Array<{
                indices: Array<number>
                text: string
              }>
              symbols: Array<any>
            }
            extended_entities?: {
              media: Array<ITweetMedia>
            }
            favorite_count: number
            favorited: boolean
            full_text: string
            is_quote_status: boolean
            lang: string
            possibly_sensitive: boolean
            possibly_sensitive_editable: boolean
            quote_count: number
            reply_count: number
            retweet_count: number
            retweeted: boolean
            source: string
            user_id_str: string
            id_str: string
          }
          quick_promote_eligibility: {
            eligibility: string
          }
          card?: {
            rest_id: string
            legacy: {
              binding_values: Array<{
                key: string
                value: {
                  image_value?: {
                    height: number
                    width: number
                    url: string
                  }
                  type: string
                  string_value?: string
                  scribe_key?: string
                  image_color_value?: {
                    palette: Array<{
                      rgb: {
                        blue: number
                        green: number
                        red: number
                      }
                      percentage: number
                    }>
                  }
                  user_value?: {
                    id_str: string
                    path: Array<any>
                  }
                }
              }>
              card_platform: {
                platform: {
                  audience: {
                    name: string
                  }
                  device: {
                    name: string
                    version: string
                  }
                }
              }
              name: string
              url: string
              user_refs: Array<{
                id: string
                rest_id: string
                affiliates_highlighted_label: {}
                has_nft_avatar: boolean
                legacy: {
                  created_at: string
                  default_profile: boolean
                  default_profile_image: boolean
                  description: string
                  entities: {
                    description: {
                      urls: Array<any>
                    }
                    url: {
                      urls: Array<{
                        display_url: string
                        expanded_url: string
                        url: string
                        indices: Array<number>
                      }>
                    }
                  }
                  fast_followers_count: number
                  favourites_count: number
                  followers_count: number
                  friends_count: number
                  has_custom_timelines: boolean
                  is_translator: boolean
                  listed_count: number
                  location: string
                  media_count: number
                  name: string
                  normal_followers_count: number
                  pinned_tweet_ids_str: Array<any>
                  profile_banner_extensions: {
                    mediaColor: {
                      r: {
                        ok: {
                          palette: Array<{
                            percentage: number
                            rgb: {
                              blue: number
                              green: number
                              red: number
                            }
                          }>
                        }
                      }
                    }
                  }
                  profile_banner_url: string
                  profile_image_extensions: {
                    mediaColor: {
                      r: {
                        ok: {
                          palette: Array<{
                            percentage: number
                            rgb: {
                              blue: number
                              green: number
                              red: number
                            }
                          }>
                        }
                      }
                    }
                  }
                  profile_image_url_https: string
                  profile_interstitial_type: string
                  protected: boolean
                  screen_name: string
                  statuses_count: number
                  translator_type: string
                  url: string
                  verified: boolean
                  withheld_in_countries: Array<any>
                }
                super_follow_eligible: boolean
                super_followed_by: boolean
                super_following: boolean
              }>
            }
          }
        }
      }
      tweetDisplayType: string
      ruxContext: string
    }
  }
}

export interface IUserTweets {
  data: {
    user: {
      result: {
        __typename: string
        timeline_v2: {
          timeline: {
            instructions: Array<{
              type: string;
              entries?: Array<ITweetEntry>;
              entry?: ITweetEntry;
            }>
            responseObjects: {
              feedbackActions: Array<{
                key: string
                value: {
                  feedbackType: string
                  feedbackUrl: string
                  encodedFeedbackRequest: string
                  hasUndoAction: boolean
                  richBehavior: {
                    type: string
                    topic: {
                      description: string
                      following: boolean
                      icon_url: string
                      topic_id: string
                      name: string
                      not_interested: boolean
                    }
                  }
                }
              }>
              immediateReactions: Array<any>
            }
          }
        }
      }
    }
  }
}

