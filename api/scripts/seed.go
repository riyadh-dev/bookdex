package main

import (
	"context"
	"fmt"

	"github.com/jaswdr/faker"
	"github.com/riyadh-dev/bookdex/api/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	MONGODB_URI := "mongodb://localhost:27017"
	DB_NAME := "bookdex"

	client, err := mongo.Connect(
		context.Background(),
		options.Client().ApplyURI(MONGODB_URI),
	)
	if err != nil {
		panic(err)
	}

	db := client.Database(DB_NAME)

	fmt.Println("❌ Dropping Collections...")
	db.Collection("users").Drop(context.Background())
	db.Collection("books").Drop(context.Background())
	db.Collection("comments").Drop(context.Background())
	db.Collection("ratings").Drop(context.Background())
	fmt.Println("❌ Collections Dropped!")

	fmt.Println("🌱 Seeding...")
	userIds := seedUsers(db.Collection("users"), 10)
	booksIds := seedBooks(db.Collection("books"), 6, userIds)
	seedComments(db.Collection("comments"), 6, userIds, booksIds)
	seedRatings(db.Collection("ratings"), userIds, booksIds)
	fmt.Println("🌱 Seeding Done!")
}

func seedUsers(coll *mongo.Collection, usersNumber int) []interface{} {
	fmt.Println("\t🧔 Seeding Users...")

	fake := faker.New()

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte("password"),
		bcrypt.DefaultCost,
	)
	if err != nil {
		panic(err)
	}

	users := make([]interface{}, usersNumber)
	for i := 0; i < usersNumber; i++ {
		gender := []string{"female", "male"}[i/2%2]

		avatar := fmt.Sprintf(
			"https://xsgames.co/randomusers/assets/avatars/%s/%d.jpg",
			gender,
			i,
		)

		user := InsertSeedUserInput{
			Email:    fake.Internet().Email(),
			Password: string(hashedPassword),
			Username: fake.Internet().User(),
			Avatar:   avatar,
			IsSeeded: true,
		}

		users[i] = user
	}

	cursor, err := coll.InsertMany(context.Background(), users)
	if err != nil {
		panic(err)
	}

	fmt.Println("\t🧔 Users Seeded!")

	return cursor.InsertedIDs
}

func seedBooks(
	coll *mongo.Collection,
	booksPerUser int,
	usersIds []interface{},
) []interface{} {
	fmt.Println("\t📚 Seeding Books...")

	books := make([]interface{}, booksPerUser*len(usersIds))

	for i := 0; i < len(usersIds); i++ {
		for j := 0; j < booksPerUser; j++ {
			submitterId, ok := usersIds[i].(primitive.ObjectID)
			if !ok {
				panic("invalid submitter id")
			}

			bookmarkerId, ok := usersIds[(i+1)%len(usersIds)].(primitive.ObjectID)
			if !ok {
				panic("invalid bookmarker id")
			}

			circularSeedBookIdx := (i*booksPerUser + j) % len(MOCK_BOOKS_DATA)

			book := InsertSeedBookInput{
				Title:         MOCK_BOOKS_DATA[circularSeedBookIdx].Title,
				Author:        MOCK_BOOKS_DATA[circularSeedBookIdx].Author,
				Cover:         MOCK_BOOKS_DATA[circularSeedBookIdx].Cover,
				Synopsis:      MOCK_BOOKS_DATA[circularSeedBookIdx].Synopsis,
				SubmitterID:   submitterId,
				BookmarkerIDs: []primitive.ObjectID{bookmarkerId},
			}

			books[i*booksPerUser+j] = book
		}
	}

	cursor, err := coll.InsertMany(context.Background(), books)
	if err != nil {
		panic(err)
	}

	fmt.Println("\t📚 Books Seeded!")

	return cursor.InsertedIDs
}

func seedComments(
	coll *mongo.Collection,
	commentsPerBook int,
	usersIds []interface{},
	booksIds []interface{},
) {
	fmt.Println("\t📃 Seeding Comments...")

	comments := make([]interface{}, commentsPerBook*len(booksIds))

	for i := 0; i < len(booksIds); i++ {
		for j := 0; j < commentsPerBook; j++ {
			bookId, ok := booksIds[i].(primitive.ObjectID)
			if !ok {
				panic("invalid book id")
			}

			circularUserIdx := (i*commentsPerBook + j) % len(usersIds)
			userId, ok := usersIds[circularUserIdx].(primitive.ObjectID)
			if !ok {
				panic("invalid user id")
			}

			comment := models.InsertCommentStorageInput{
				BookID:   bookId,
				AuthorID: userId,
				Text:     "This is a good book!",
			}

			comments[i*commentsPerBook+j] = comment
		}
	}

	_, err := coll.InsertMany(context.Background(), comments)
	if err != nil {
		panic(err)
	}

	fmt.Println("\t📃 Comments Seeded!")
}

func seedRatings(
	coll *mongo.Collection,
	usersIds []interface{},
	booksIds []interface{},
) {
	fmt.Println("\t⭐ Seeding Ratings...")

	ratings := make([]interface{}, len(booksIds)*len(usersIds))

	for i := 0; i < len(booksIds); i++ {
		for j := 0; j < len(usersIds); j++ {
			bookId, ok := booksIds[i].(primitive.ObjectID)
			if !ok {
				panic("invalid book id")
			}

			userId, ok := usersIds[j].(primitive.ObjectID)
			if !ok {
				panic("invalid user id")
			}

			rating := models.Rating{
				BookID:  bookId,
				RaterID: userId,
				Value:   5,
			}

			ratings[i*len(usersIds)+j] = rating
		}
	}

	_, err := coll.InsertMany(context.Background(), ratings)
	if err != nil {
		panic(err)
	}

	fmt.Println("\t⭐ Ratings Seeded!")
}

type InsertSeedUserInput struct {
	Email    string `bson:"email"`
	Password string `bson:"password"`
	Username string `bson:"username"`
	Avatar   string `bson:"avatar"`
	IsSeeded bool   `bson:"is_seeded"`
}

type InsertSeedBookInput struct {
	Title         string               `bson:"title"`
	Author        string               `bson:"author"`
	Cover         string               `bson:"cover"`
	Synopsis      string               `bson:"synopsis"`
	SubmitterID   primitive.ObjectID   `bson:"submitterId"`
	BookmarkerIDs []primitive.ObjectID `bson:"bookmarkerIds"`
}

var MOCK_BOOKS_DATA = []models.InsertBookStorageInput{
	{
		Title:  "One Punch-Man",
		Author: "Murata Yusuke",
		Cover:  "https://cdn.myanimelist.net/images/manga/2/80663l.jpg",
		Synopsis: `After rigorously training for three years, the ordinary Saitama has gained immense strength which allows him to take out anyone and anything with just one punch. He decides to put his new skill to good use by becoming a hero. However, he quickly becomes bored with easily defeating monsters, and wants someone to give him a challenge to bring back the spark of being a hero.
		Upon bearing witness to Saitama's amazing power, Genos, a cyborg, is determined to become Saitama's apprentice. During this time, Saitama realizes he is neither getting the recognition that he deserves nor known by the people due to him not being a part of the Hero Association. Wanting to boost his reputation, Saitama decides to have Genos register with him, in exchange for taking him in as a pupil. Together, the two begin working their way up toward becoming true heroes, hoping to find strong enemies and earn respect in the process.`,
	}, {
		Title:  "Spy x Family",
		Author: "Endou Tatsuya",
		Cover:  "https://cdn.myanimelist.net/images/manga/4/279344l.jpg",
		Synopsis: `For the agent known as "Twilight," no order is too tall if it is for the sake of peace. Operating as Westalis' master spy, Twilight works tirelessly to prevent extremists from sparking a war with neighboring country Ostania. For his latest mission, he must investigate Ostanian politician Donovan Desmond by infiltrating his son's school: the prestigious Eden Academy. Thus, the agent faces the most difficult task of his career: get married, have a child, and play family.
		Twilight, or "Loid Forger," quickly adopts the unassuming orphan Anya to play the role of a six-year-old daughter and prospective Eden Academy student. For a wife, he comes across Yor Briar, an absent-minded office worker who needs a pretend partner of her own to impress her friends. However, Loid is not the only one with a hidden nature. Yor moonlights as the lethal assassin "Thorn Princess." For her, marrying Loid creates the perfect cover. Meanwhile, Anya is not the ordinary girl she appears to be; she is an esper, the product of secret experiments that allow her to read minds. Although she uncovers their true identities, Anya is thrilled that her new parents are cool secret agents! She would never tell them, of course. That would ruin the fun.
		Under the guise of "The Forgers," the spy, the assassin, and the esper must act as a family while carrying out their own agendas. Although these liars and misfits are only playing parts, they soon find that family is about far more than blood relations.`,
	}, {
		Title:  "Kaguya-sama: Love Is War",
		Author: "Akasaka Aka",
		Cover:  "https://cdn.myanimelist.net/images/manga/2/259833l.jpg",
		Synopsis: `Considered a genius due to having the highest grades in the country, Miyuki Shirogane leads the prestigious Shuchiin Academy's student council as its president, working alongside the beautiful and wealthy vice president Kaguya Shinomiya. The two are often regarded as the perfect couple by students despite them not being in any sort of romantic relationship.
		However, the truth is that after spending so much time together, the two have developed feelings for one another; unfortunately, neither is willing to confess, as doing so would be a sign of weakness. With their pride as elite students on the line, Miyuki and Kaguya embark on a quest to do whatever is necessary to get a confession out of the other. Through their daily antics, the battle of love begins!`,
	}, {
		Title:    "Gokurakugai",
		Author:   "Sano Yuuto",
		Cover:    "https://cdn.myanimelist.net/images/manga/2/271134l.jpg",
		Synopsis: `Gokurakugai, a bright and bustling working class district with a hidden dark side. In this area without order, Tao and Alma work as troubleshooters for hire. Their missions involve helping a young boy find his lost friend, a person who disappears without a trace, and disfigured animal corpses. All the while, the evil spirits who live in the shadows bring out a different side to these troubleshooters!`,
	}, {
		Title:  "Bleach",
		Author: "Kubo Tite",
		Cover:  "https://cdn.myanimelist.net/images/manga/3/299567l.jpg",
		Synopsis: `For as long as he can remember, high school student Ichigo Kurosaki has been able to see the spirits of the dead, but that has not stopped him from leading an ordinary life. One day, Ichigo returns home to find an intruder in his room who introduces herself as Rukia Kuchiki, a Soul Reaper tasked with helping souls pass over. Suddenly, the two are jolted from their conversation when a Hollow—an evil spirit known for consuming souls—attacks. As Ichigo makes a brash attempt to stop the Hollow, Rukia steps in and shields him from a counterattack. Injured and unable to keep fighting, Rukia suggests a risky plan—transfer half of her Soul Reaper powers to Ichigo. He accepts and, to Rukia's surprise, ends up absorbing her powers entirely, allowing him to easily dispatch the Hollow.
		Now a Soul Reaper himself, Ichigo must take up Rukia's duties of exterminating Hollows and protecting spirits, both living and dead. Along with his friends Orihime Inoue and Yasutora Sado—who later discover spiritual abilities of their own—Ichigo soon learns that the consequences of becoming a Soul Reaper and dealing with the world of spirits are far greater than he ever imagined.`,
	}, {
		Title:  "Gokushufudou",
		Author: "Oono Kousuke",
		Cover:  "https://cdn.myanimelist.net/images/manga/3/210716l.jpg",
		Synopsis: `Immortal Tatsu," the legendary yakuza who single-handedly defeated a rival gang with a lead pipe, is a name known to strike fear in both hardened police officers and vicious criminals. Soon after his sudden disappearance, he resurfaces with a slight change in profession. Now equipped with an apron, Tatsu has given up violence and is trying to make an honest living as a house husband.
		While adapting to mundane household tasks, Tatsu finds that being a house husband has its own challenges, from the battlefield known as supermarket sales to failures in the kitchen. Despite living peacefully, misunderstandings seem to follow him left and right. Gokushufudou follows the daily life of the comically serious ex-yakuza as he leaves behind his dangerous previous life to become a stay-at-home husband.`,
	}, {
		Title:    "Sun-Ken Rock",
		Author:   "Young King",
		Cover:    "https://cdn.myanimelist.net/images/manga/3/166298l.jpg",
		Synopsis: `The story revolves around Ken, a man from an upper-class family that was orphaned young due to his family's involvement with the Yakuza; he became a high school delinquent known for fighting. The only thing that motivates him to take action is through his romantic affections for a classmate, Yumi. After learning she decided to move to Korea to become a police officer, Ken leaves his life in Japan behind and tries to follow in Yumi's footsteps; due to unforeseen circumstances, he incidentally becomes the head of a local gang and tries to hide it from Yumi. As the leader, the gang is renamed the Sun-Ken Rock Group.`,
	}, {
		Title:  "Gintama",
		Author: "Sorachi Hideaki",
		Cover:  "https://cdn.myanimelist.net/images/manga/3/267795l.jpg",
		Synopsis: `During the Edo period, Japan is suddenly invaded by alien creatures known as the "Amanto." Despite the samurai's attempts to combat the extraterrestrial menace, the Shogun soon realizes that their efforts are futile and decides to surrender. This marks the beginning of an uneasy agreement between the Shogunate and Amanto, one that results in a countrywide sword ban and the disappearance of the samurai spirit.
		However, there exists one eccentric individual who wields a wooden sword and refuses to let his samurai status die. Now that his kind are no longer needed, Gintoki Sakata performs various odd jobs around town in order to make ends meet. Joined by his self-proclaimed disciple Shinpachi Shimura, the fearsome alien Kagura, and a giant dog named Sadaharu, they run the business known as Yorozuya, often getting caught up in all sorts of crazy and hilarious shenanigans.`,
	}, {
		Title:    "Mieruko-chan",
		Author:   "Izumi Tomoki",
		Cover:    "https://cdn.myanimelist.net/images/manga/3/217799l.jpg",
		Synopsis: `Miko Yotsuya is a typical high school student whose life turns upside down when she suddenly starts to see gruesome and hideous monsters. Despite being completely terrified, Miko carries on with her daily life, pretending not to notice the horrors that surround her. She must endure the fear in order to keep herself and her friend Hana Yurikawa out of danger, even if that means coming face to face with the absolute worst. Blending both comedy and horror, Mieruko-chan tells the story of a girl who tries to deal with the paranormal by acting indifferent toward it.`,
	}, {
		Title:  "Kuroko no Basket",
		Author: "Fujimaki Tadatoshi",
		Cover:  "https://cdn.myanimelist.net/images/manga/4/67695.jpg",
		Synopsis: `Teikou Middle School is famous for its highly renowned basketball team, which produced the famed "Generation of Miracles": a team of five prodigies, each with their own unique abilities, considered to be undefeatable by the time they became third years. However, blinded by pride, they split up, entering different high schools upon graduation.
		Taiga Kagami, having just returned from America, joins the basketball team at Seirin High School in search of strong team members. There, he finds Tetsuya Kuroko, a seemingly unimpressive player, only for Kagami to find out that Kuroko was the "Phantom Sixth Man" of the Generation of Miracles: an invisible player who used his impeccable passing skills to support the team from the shadows. Together, they resolve to defeat the Generation of Miracles and make the Seirin basketball team the best in Japan.`,
	},
}
